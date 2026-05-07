$repo = 'C:\Users\Abhi\Documents\Aevum AI'
Set-Location $repo
$prefix = 'Documents/Aevum AI/'
$paths = git ls-files | Where-Object { $_ -like "$prefix*" }
if (-not $paths -or $paths.Count -eq 0) {
    Write-Host 'No prefixed files found'
    exit 0
}
Write-Host "Found $($paths.Count) prefixed files — moving..."
foreach ($old in $paths) {
    $new = $old.Substring($prefix.Length)
    $dir = Split-Path $new -Parent
    if ($dir -ne '') { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    Write-Host "git mv -f -- '$old' '$new'"
    git mv -f -- "$old" "$new"
}

git add -A
try { git commit -m "Normalize repo: move files out of 'Documents/Aevum AI' prefix to root" } catch { Write-Host 'no changes to commit' }
git push origin master
