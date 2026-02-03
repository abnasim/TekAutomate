# MSO 4/5/6/7 Series: User Account vs. Automation Permissions

**Category:** connection_hardware
**ID:** mso_456_permissions

---


## The Permission Problem

MSO 4/5/6/7 Series oscilloscopes run Windows and have user account controls. Some operations require "Automation" permissions rather than "User" permissions.


### What\

User Account: Limited permissions, can't modify certain system settings

Automation Account: Full permissions for remote control and automation


### How to Enable Automation Mode

1. On the scope, press Utility → System → Security

2. Enable "Automation Account" or "Remote Control"

3. You may need to set a password

4. Some scopes require a reboot after enabling

> ⚠️ **Security Note**
> 
> Automation mode gives full control to remote connections. Only enable it in secure lab environments, not on production networks.


### Common Issues

• Commands work locally but fail remotely → Check automation permissions

• File operations fail → May need automation account

• Settings don't persist → User account limitations

