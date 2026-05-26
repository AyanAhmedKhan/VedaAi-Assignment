param([string]$OutDir = "public/figma/screen4")

$assets = @{
  "icon-book"        = "f0aac582-17fa-416f-96e5-852d673568ba"
  "vector-mygroups"  = "5c01a053-7f25-4565-97c1-4ff97af57fdf"
  "vector-home"      = "f05b3e72-ad0f-4a72-ad00-6a73243d4269"
  "avatar-school"    = "94f1074c-c9fe-45c0-a76b-24246b464e8d"
  "avatar-john"      = "c45e4b9c-d7f2-43d1-bf0a-7276f6fe17ff"
  "logo"             = "8095f8a2-7a05-4eff-9b12-a28f417b4d2b"
  "logo-spark"       = "cd45a153-16d9-4719-a47c-3aa3639e0043"
  "vector5"          = "56fdc828-0a7d-48d9-848f-d4577ebd1d86"
  "vector6"          = "1eaf0c40-58b9-4017-9745-a42beaebde12"
  "rect14"           = "7eae4200-66c3-4e68-bb82-960d0a9f95ca"
  "rect15"           = "d8e10ea8-118f-4104-9bff-1cad736ef1f5"
  "vector-credit"    = "a7042cc2-ff61-44ab-8c3e-1653a36ddca6"
  "vector-credit2"   = "f58c5c2b-6244-43fb-a174-bd7bf3991edd"
  "settings-stroke"  = "e6ceb5d6-c88a-403a-a787-7e048cce21a4"
  "settings-union"   = "fdb00d0c-51d2-4d87-9508-43adeab04b34"
  "download-icon"    = "d8c20214-016b-4073-8fdf-ad1ad9cff150"
  "arrow-left"       = "e9debba0-5989-4b73-9038-b31d2e3ad0fd"
  "topbar-spark"     = "cc725d70-9d02-48e7-b199-69e1e33aee15"
  "bell"             = "6072609e-6a5f-40e3-957d-be1f6d1ff4b9"
  "bell-clapper"     = "b037f9fc-9fcd-419a-90ab-5c6ef76e82f0"
  "bell-dot"         = "4548c9ec-0e37-4556-97fc-f653611aa458"
  "chevron-down"     = "a0a134d5-617c-4d86-bd13-70f597ef90f4"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$base = "https://www.figma.com/api/mcp/asset/"

$ok = 0; $fail = 0
foreach ($k in $assets.Keys) {
  $url = $base + $assets[$k]
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
    $ct = $resp.Headers['Content-Type']
    if ($ct -is [array]) { $ct = $ct[0] }
    $ext = if ($ct -match 'svg') { '.svg' } elseif ($ct -match 'png') { '.png' } elseif ($ct -match 'jpe?g') { '.jpg' } else { '.bin' }
    $out = Join-Path $OutDir ($k + $ext)
    if ($resp.Content -is [string]) {
      [IO.File]::WriteAllText($out, $resp.Content, [Text.UTF8Encoding]::new($false))
    } else {
      [IO.File]::WriteAllBytes($out, $resp.Content)
    }
    $ok++
  } catch {
    Write-Host "FAIL $k : $($_.Exception.Message)"
    $fail++
  }
}
Write-Host "Downloaded $ok / $($assets.Count). Failures: $fail"
