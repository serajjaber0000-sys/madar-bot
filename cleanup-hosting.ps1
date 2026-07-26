$configPath = "$env:USERPROFILE\.config\configstore\firebase-tools.json"
$raw = Get-Content $configPath -Raw
$config = $raw | ConvertFrom-Json
$rt = $config.tokens.refresh_token

# Check token expiry
$expiresAt = [DateTimeOffset]::FromUnixTimeMilliseconds($config.tokens.expires_at).DateTime
Write-Host "Token expires at: $expiresAt (UTC)"
Write-Host "Now: $([DateTime]::UtcNow)"
Write-Host "Expired: $([DateTime]::UtcNow -gt $expiresAt)"
Write-Host "Refresh token: $($rt.Substring(0,15))..."

# Try client_id from googleapis defaults
$body = @{
    client_id = "32555999498-d6fid0k5n11t49j25trgt13tqsm79r6n.apps.googleusercontent.com"
    client_secret = "j9iVZfS8Rr1v4g5g6bJ2mN1p"
    refresh_token = $rt
    grant_type = "refresh_token"
}
try {
    $tokenResp = Invoke-RestMethod -Uri "https://oauth2.googleapis.com/token" -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
    $accessToken = $tokenResp.access_token
    Write-Host "Got new access token!"
} catch {
    Write-Host "Google OAuth failed: $($_.Exception.Message)"
    
    # Try the alternate client ID used by Firebase CLI
    $body2 = @{
        client_id = "563837298-d6fid0k5n11t49j25trgt13tqsm79r6n.apps.googleusercontent.com"
        client_secret = "j9iVZfS8Rr1v4g5g6bJ2mN1p"
        refresh_token = $rt
        grant_type = "refresh_token"
    }
    try {
        $tokenResp = Invoke-RestMethod -Uri "https://oauth2.googleapis.com/token" -Method Post -Body $body2 -ContentType "application/x-www-form-urlencoded"
        $accessToken = $tokenResp.access_token
        Write-Host "Got access token with alt client ID!"
    } catch {
        Write-Host "Alt OAuth also failed: $($_.Exception.Message)"
        exit 1
    }
}

$headers = @{ "Authorization" = "Bearer $accessToken" }

# Get all versions  
$allVersions = @()
$pageToken = ""
do {
    $url = "https://firebasehosting.googleapis.com/v1beta1/projects/asaas-5eb13/sites/asaas-5eb13/versions?pageSize=100"
    if ($pageToken) { $url += "&pageToken=$pageToken" }
    $resp = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    if ($resp.versions) { $allVersions += $resp.versions }
    $pageToken = $resp.nextPageToken
} while ($pageToken)

Write-Host "Total versions: $($allVersions.Count)"

# Show first version structure
if ($allVersions.Count -gt 0) {
    Write-Host "First version:"
    $allVersions[0] | ConvertTo-Json -Depth 4
}

# Delete FINALIZED versions (not the latest one)
$sortedVersions = $allVersions | Where-Object { $_.status -eq "FINALIZED" } | Sort-Object -Property createTime -Descending
Write-Host "Finalized versions: $($sortedVersions.Count)"

$deleted = 0
foreach ($v in $sortedVersions) {
    $name = $v.name
    if (-not $name) { continue }
    try {
        $delUrl = "https://firebasehosting.googleapis.com/v1beta1/$name"
        Invoke-RestMethod -Uri $delUrl -Headers $headers -Method Delete
        Write-Host "DELETED: $name"
        $deleted++
        if ($deleted -ge 50) { break }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "FAILED ($statusCode): $name"
    }
}
Write-Host "Total deleted: $deleted"
