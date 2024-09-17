# Constants
$DIRECTORIES_TO_PROCESS = @(
    ".\app\routes"
    #".\app\stores",
    #".\app\components\repo",
    #".\app\components\checkout"
)

$REMOVE_ES6_IMPORTS = $true  # Set to $false to keep import statements

# File extensions to process
$FILE_EXTENSIONS = @("*.js", "*.ts", "*.jsx", "*.tsx")

# Updated regex pattern to match ES6 imports and TypeScript 'import type' statements
$IMPORT_REGEX = '(?m)^\s*(import\s+(?:type\s+)?(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?[''"](?:(?![''"]\s*[;$]).)*[''"]\s*;?\s*$|import\s*\([''"](?:(?![''"]\s*\)).)*[''"]?\s*\)\s*;?\s*$)'

function Parse-GitIgnore {
    if (Test-Path .gitignore) {
        Get-Content .gitignore | Where-Object { $_ -notmatch '^\s*#' -and $_.Trim() -ne '' } | ForEach-Object {
            $pattern = $_ -replace '\.', '\.' -replace '\*', '.*'
            "^$pattern"
        }
    } else {
        @()
    }
}

# Function to check if a file is ignored
function Test-Ignored {
    param($file, $ignorePatterns)
    $relativePath = $file.FullName.Substring($PWD.Path.Length + 1) -replace '\\', '/'
    foreach ($pattern in $ignorePatterns) {
        if ($relativePath -match $pattern) {
            return $true
        }
    }
    return $false
}

# Function to get relative path
function Get-RelativePath {
    param($path)
    $relativePath = $path -replace [regex]::Escape($PWD.Path), "."
    return $relativePath -replace '\\', '/'
}

# Function to process a file
function Process-File {
    param($file)
    # Skip files larger than 1MB
    if ($file.Length -gt 1MB) {
        Write-Host "Skipping large file: $($file.FullName)"
        return $null
    }
    $content = Get-Content $file.FullName -Raw
    
    if ($REMOVE_ES6_IMPORTS) {
        $content = $content -replace $IMPORT_REGEX, ''
        # Remove any resulting empty lines
        $content = $content -replace '(?m)^\s*$\n', ''
    }
    
    $content = $content -replace '\\', '\\' -replace '"', '\"' -replace "`r`n", '\n' -replace "`n", '\n'
    
    return @{
        source = Get-RelativePath $file.FullName
        document_content = $content
    }
}

# Function to send POST request
function Send-JsonToLocalhost {
    param($jsonData)
    $uri = "http://localhost:3000/test"
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $uri -Method Post -Body $jsonData -Headers $headers
        Write-Host "Data successfully sent to $uri"
        return $response
    }
    catch {
        Write-Error "Failed to send data to $uri. Error: $_"
    }
}

# Main script
$ignorePatterns = Parse-GitIgnore

# If no directories exist, use all directories in the current path
if (-not (Test-Path $DIRECTORIES_TO_PROCESS[0])) {
    $directoriesToUse = Get-ChildItem -Directory | Select-Object -ExpandProperty FullName
} else {
    $directoriesToUse = $DIRECTORIES_TO_PROCESS
}

$files = $directoriesToUse | ForEach-Object {
    Get-ChildItem -Path $_ -Recurse -File -Include $FILE_EXTENSIONS | Where-Object { -not (Test-Ignored $_ $ignorePatterns) }
}

$output = @($files | ForEach-Object { Process-File $_ } | Where-Object { $_ -ne $null })
$jsonOutput = ConvertTo-Json -InputObject $output -Depth 10 -Compress

# Save JSON to file
$jsonOutput | Out-File -FilePath ".\docs\context.json" -Encoding utf8
Write-Host "Context file generated: context.json"

# Send JSON data to localhost:3000
Send-JsonToLocalhost -jsonData $jsonOutput
