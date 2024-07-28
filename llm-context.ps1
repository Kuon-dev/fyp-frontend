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

# Function to process a file
function Process-File {
    param($file)
    # Skip files larger than 1MB
    if ($file.Length -gt 1MB) {
        Write-Host "Skipping large file: $($file.FullName)"
        return
    }
    $content = (Get-Content $file.FullName -Raw) -replace '"', '\"' -replace "`r`n", '\n' -replace "`n", '\n'
    @"
<document>
<source>$($file.FullName)</source>
<document_content>$content</document_content>
</document>
"@
}

# Main script
$ignorePatterns = Parse-GitIgnore
$directories = @(".\app\routes", ".\app\stores", ".\app\components\repo", ".\app\components\checkout")
$files = $directories | ForEach-Object {
    Get-ChildItem -Path $_ -Recurse -File | Where-Object { -not (Test-Ignored $_ $ignorePatterns) }
}

$output = $files | ForEach-Object { Process-File $_ }
$output | Out-File -FilePath ".\docs\context.xml" -Encoding utf8
Write-Host "Context file generated: context_focused.xml"
