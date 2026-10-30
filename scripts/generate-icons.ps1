Add-Type -AssemblyName System.Drawing

$srcPath = "D:\dhd\notion-highlight\notion_highlight_logo_indigo_v3.png"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source logo file not found: $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

$targets = @(
    "D:\dhd\notion-highlight\apps\extension\public\icons",
    "D:\dhd\notion-highlight\apps\web\public\icons"
)

# Icon content bounds: minX=156, minY=156, maxX=868, maxY=868 (size 712x712).
# We crop tightly with a tiny 4px anti-aliasing margin: [152, 152, 720, 720]
# This eliminates the 156px transparent border so the icon fills the entire slot
# in Chrome's pin bar (toolbar) and chrome://extensions management page.
$srcRect = New-Object System.Drawing.Rectangle(152, 152, 720, 720)

$sizes = @(
    @{ name = "icon16.png"; width = 16; height = 16 },
    @{ name = "icon19.png"; width = 19; height = 19 },
    @{ name = "icon32.png"; width = 32; height = 32 },
    @{ name = "icon38.png"; width = 38; height = 38 },
    @{ name = "icon48.png"; width = 48; height = 48 },
    @{ name = "icon128.png"; width = 128; height = 128 },
    @{ name = "logo.png"; width = 512; height = 512 }
)

foreach ($targetDir in $targets) {
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    foreach ($s in $sizes) {
        $destPath = Join-Path $targetDir $s.name
        $bmp = New-Object System.Drawing.Bitmap($s.width, $s.height)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        $g.Clear([System.Drawing.Color]::Transparent)
        $destRect = New-Object System.Drawing.Rectangle(0, 0, $s.width, $s.height)
        $g.DrawImage($srcImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()
        
        $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        Write-Host "Generated cropped $($s.name) ($($s.width)x$($s.height)) at $destPath"
    }
}

$srcImg.Dispose()
Write-Host "SUCCESS: Cropped edge-to-edge icons generated for pin bar and extension management!"
