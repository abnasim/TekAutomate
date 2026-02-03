# Connection Refused: Troubleshooting

**Category:** troubleshooting
**ID:** connection_refused

---


## What This Error Means

The instrument is reachable but refusing the connection.


### Possible Causes

1. Another PC Connected:

   • SCPI connections are often exclusive

   • Check if another computer is controlling the scope

   • Disconnect other sessions first

2. Scope's Server Feature Turned Off:

   • Check Utility → I/O → Network

   • Ensure "SCPI Server" or "Remote Control" is enabled

   • Some scopes require a reboot after enabling

3. Wrong Port:

   • Port 4000 vs. 5025 vs. 1024

4. Firewall on Scope:

   • Windows-based scopes may have Windows Firewall enabled

   • Check firewall settings on the scope

