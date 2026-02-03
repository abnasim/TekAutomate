# Security Considerations: Network Security, Firewall Configuration, Secure Connections

**Category:** connection_hardware
**ID:** security_considerations

---


## Securing Your Tektronix Instrument Network

When connecting Tektronix instruments to networks, security is crucial, especially in production environments.


### 1. Network Isolation

Best practice: Isolate test equipment on a separate network:

• Use a dedicated switch/router for instruments

• Don't connect instruments directly to corporate networks

• Use VLANs to segment instrument traffic


### 2. Firewall Configuration

Configure firewalls to allow only necessary ports:

• Block all other ports


### 3. Static IP vs. DHCP

For automation, use static IPs:

• Prevents IP changes that break scripts

• More predictable network behavior

• Set on instrument: Utility → I/O → Network → Static IP

Enable authentication on Windows-based scopes:

• Utility → System → Security → Enable Authentication

• Set strong passwords for Automation account

• Disable User account if not needed

• Note: Authentication may require additional setup in your scripts

For LXI web interface, use HTTPS if available:


### 6. Script Security

Protect sensitive information in scripts:


### 7. Network Monitoring

Monitor instrument network traffic:

• Use network monitoring tools to detect unauthorized access

• Log all SCPI connections

• Set up alerts for unusual activity

> ⚠️ **Production Networks**
> 
> Never connect instruments with automation enabled directly to production networks. Always use isolated test networks or VPNs.

