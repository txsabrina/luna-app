param(
    [switch]$FrontendOnly,
    [switch]$InstallDependencies,
    [switch]$NoBrowser,
    [ValidateRange(30, 900)]
    [int]$TimeoutSeconds = 240
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# O script deve ficar em luna-app/scripts/.
$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root 'frontend'
$backend = Join-Path $root 'backend'

$frontendUrl = 'http://127.0.0.1:5173'
$backendHealthUrl = 'http://127.0.0.1:8080/q/health'

function Assert-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Comando '$Name' não encontrado. Verifique a instalação e o PATH."
    }
}

function Assert-FreePort {
    param([int]$Port)

    $listener = Get-NetTCPConnection `
        -LocalPort $Port `
        -State Listen `
        -ErrorAction SilentlyContinue

    if ($listener) {
        $owners = ($listener |
            Select-Object -ExpandProperty OwningProcess -Unique) -join ', '

        throw @"
A porta $Port já está em uso. PID(s): $owners.
O script não vai encerrar nem reutilizar esse processo automaticamente.
Confira se uma instância anterior do Luna já está aberta.
"@
    }
}

function ConvertTo-PowerShellLiteral {
    param([string]$Value)

    return "'" + $Value.Replace("'", "''") + "'"
}

function Start-ServiceWindow {
    param(
        [string]$Title,
        [string]$Directory,
        [string]$Command
    )

    $directoryLiteral = ConvertTo-PowerShellLiteral $Directory
    $titleLiteral = ConvertTo-PowerShellLiteral $Title

    $session = @"
`$ErrorActionPreference = 'Stop'
`$Host.UI.RawUI.WindowTitle = $titleLiteral
Set-Location -LiteralPath $directoryLiteral

Write-Host $titleLiteral -ForegroundColor Cyan
Write-Host 'Para parar este serviço, pressione Ctrl+C nesta janela.'
Write-Host ''

$Command

if (`$LASTEXITCODE -ne 0) {
    Write-Host "Processo encerrou com código `$LASTEXITCODE." -ForegroundColor Red
}
"@

    $encoded = [Convert]::ToBase64String(
        [Text.Encoding]::Unicode.GetBytes($session)
    )

    Start-Process `
        -FilePath 'powershell.exe' `
        -ArgumentList @(
            '-NoProfile',
            '-NoExit',
            '-EncodedCommand',
            $encoded
        ) | Out-Null
}

function Wait-HttpReady {
    param(
        [string]$Url,
        [string]$ServiceName
    )

    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)

    Write-Host "Aguardando $ServiceName..." -ForegroundColor Cyan

    while ([DateTime]::UtcNow -lt $deadline) {
        try {
            $response = Invoke-WebRequest `
                -Uri $Url `
                -UseBasicParsing `
                -TimeoutSec 3 `
                -ErrorAction Stop

            if ($response.StatusCode -ge 200 -and
                $response.StatusCode -lt 300) {
                Write-Host "$ServiceName respondeu." -ForegroundColor Green
                return
            }
        }
        catch {
            # O serviço pode estar compilando, iniciando ou indisponível.
            # A saída detalhada fica na janela dedicada do serviço.
        }

        Start-Sleep -Seconds 2
    }

    throw @"
$ServiceName não ficou disponível em $TimeoutSeconds segundos.
Endereço verificado: $Url

Confira a janela do serviço para encontrar o erro.
As janelas abertas serão mantidas para você consultar a saída.
"@
}

try {
    if (-not (Test-Path -LiteralPath (Join-Path $frontend 'package.json'))) {
        throw "Não encontrei frontend/package.json. Salve o script em scripts/start-luna.ps1."
    }

    Assert-Command 'powershell.exe'
    Assert-Command 'npm.cmd'
    Assert-Command 'node'
    Assert-Command 'Get-NetTCPConnection'

    Assert-FreePort 5173

    if (-not $FrontendOnly) {
        if (-not (Test-Path -LiteralPath (Join-Path $backend 'mvnw.cmd'))) {
            throw 'Não encontrei backend/mvnw.cmd.'
        }

        Assert-Command 'java'
        Assert-Command 'docker'
        Assert-FreePort 8080

        & docker info *> $null

        if ($LASTEXITCODE -ne 0) {
            throw @"
Docker não está disponível.
Abra o Docker Desktop e aguarde o engine iniciar.
Depois execute o script novamente.
"@
        }
    }

    if ($InstallDependencies) {
        Write-Host 'Instalando dependências do frontend...' -ForegroundColor Cyan

        Push-Location $frontend

        try {
            if (Test-Path -LiteralPath 'package-lock.json') {
                & npm.cmd ci
            }
            else {
                & npm.cmd install
            }

            if ($LASTEXITCODE -ne 0) {
                throw 'A instalação das dependências falhou. Confira a saída do npm.'
            }
        }
        finally {
            Pop-Location
        }
    }

    $viteCommand = Join-Path $frontend 'node_modules/.bin/vite.cmd'

    if (-not (Test-Path -LiteralPath $viteCommand)) {
        throw @"
Dependências do frontend ausentes ou incompletas.

Execute novamente com:
.\scripts\start-luna.ps1 -InstallDependencies

O script não instala dependências sem essa opção.
"@
    }

    if (-not $FrontendOnly) {
        Start-ServiceWindow `
            -Title 'Luna — Backend Quarkus' `
            -Directory $backend `
            -Command '& .\mvnw.cmd quarkus:dev "-Dquarkus.http.port=8080" "-Dquarkus.http.host=127.0.0.1"'

        Wait-HttpReady `
            -Url $backendHealthUrl `
            -ServiceName 'Backend Quarkus'
    }

    Start-ServiceWindow `
        -Title 'Luna — Frontend Vite' `
        -Directory $frontend `
        -Command '& npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort'

    Wait-HttpReady `
        -Url $frontendUrl `
        -ServiceName 'Frontend Vite'

    if (-not $NoBrowser) {
        Start-Process 'http://localhost:5173'
    }

    Write-Host ''
    Write-Host 'Luna disponível em http://localhost:5173' -ForegroundColor Green

    if ($FrontendOnly) {
        Write-Host 'Modo somente frontend: recursos dependentes da API podem não carregar.' `
            -ForegroundColor Yellow
    }

    Write-Host ''
    Write-Host 'Os serviços continuam nas janelas abertas.'
    Write-Host 'Para encerrar: Ctrl+C em cada janela e depois feche-as.'
    Write-Host 'Este iniciador não executa lint, build ou testes.'
}
catch {
    Write-Host ''
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}