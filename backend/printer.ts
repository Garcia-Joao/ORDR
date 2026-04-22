import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

type PrintOptions = {
  printerName?: string
  feedLines?: number
  cut?: boolean
}

function escapePowerShellString(value: string): string {
  return value.replace(/'/g, "''")
}

export async function printRawThermalText(
  content: string,
  options: PrintOptions = {}
): Promise<void> {
  const {
    printerName = 'TM-T20',
    feedLines = 6,
    cut = true,
  } = options

  const escapedPrinterName = escapePowerShellString(printerName)
  const escapedContent = escapePowerShellString(content)

  const cutCommand = cut ? '$allBytes += [byte[]](0x1D, 0x56, 0x00)' : ''

  const psScript = `
$printerName = '${escapedPrinterName}'
$content = @'
${escapedContent}
'@
$feedLines = ${feedLines}

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class RawPrinterHelper
{
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    public class DOCINFO
    {
        [MarshalAs(UnmanagedType.LPWStr)]
        public string pDocName;
        [MarshalAs(UnmanagedType.LPWStr)]
        public string pOutputFile;
        [MarshalAs(UnmanagedType.LPWStr)]
        public string pDataType;
    }

    [DllImport("winspool.Drv", EntryPoint="OpenPrinterW", SetLastError=true, CharSet=CharSet.Unicode)]
    public static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

    [DllImport("winspool.Drv", SetLastError=true)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint="StartDocPrinterW", SetLastError=true, CharSet=CharSet.Unicode)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, DOCINFO di);

    [DllImport("winspool.Drv", SetLastError=true)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", SetLastError=true)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", SetLastError=true)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", SetLastError=true)]
    public static extern bool WritePrinter(IntPtr hPrinter, byte[] data, int buf, out int pcWritten);
}
"@

function Send-RawBytesToPrinter {
    param(
        [Parameter(Mandatory=$true)][string]$PrinterName,
        [Parameter(Mandatory=$true)][byte[]]$Bytes
    )

    $hPrinter = [IntPtr]::Zero
    $docInfo = New-Object RawPrinterHelper+DOCINFO
    $docInfo.pDocName = "Node Thermal Print"
    $docInfo.pDataType = "RAW"

    $opened = [RawPrinterHelper]::OpenPrinter($PrinterName, [ref]$hPrinter, [IntPtr]::Zero)
    if (-not $opened) {
        throw "Could not open printer '$PrinterName'. Win32 error: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
    }

    try {
        $startedDoc = [RawPrinterHelper]::StartDocPrinter($hPrinter, 1, $docInfo)
        if (-not $startedDoc) {
            throw "Could not start print document. Win32 error: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
        }

        try {
            $startedPage = [RawPrinterHelper]::StartPagePrinter($hPrinter)
            if (-not $startedPage) {
                throw "Could not start print page. Win32 error: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
            }

            try {
                $written = 0
                $ok = [RawPrinterHelper]::WritePrinter($hPrinter, $Bytes, $Bytes.Length, [ref]$written)
                if (-not $ok) {
                    throw "Could not write to printer. Win32 error: $([Runtime.InteropServices.Marshal]::GetLastWin32Error())"
                }

                if ($written -ne $Bytes.Length) {
                    throw "Incomplete write. Expected $($Bytes.Length) bytes, wrote $written bytes."
                }
            }
            finally {
                [void][RawPrinterHelper]::EndPagePrinter($hPrinter)
            }
        }
        finally {
            [void][RawPrinterHelper]::EndDocPrinter($hPrinter)
        }
    }
    finally {
        [void][RawPrinterHelper]::ClosePrinter($hPrinter)
    }
}

$printer = Get-Printer -Name $printerName -ErrorAction SilentlyContinue
if (-not $printer) {
    throw "Printer '$printerName' not found."
}

$textBytes = [System.Text.Encoding]::ASCII.GetBytes($content)

$feedText = ""
for ($i = 0; $i -lt $feedLines; $i++) {
    $feedText += [Environment]::NewLine
}

$feedBytes = [System.Text.Encoding]::ASCII.GetBytes($feedText)
$allBytes = $textBytes + $feedBytes
${cutCommand}

Send-RawBytesToPrinter -PrinterName $printerName -Bytes $allBytes
Write-Host "Print job sent successfully."
`

  await execFileAsync('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    psScript,
  ])
}