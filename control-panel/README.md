# BEESAM App Control Panel

This control panel allows you to remotely control your BEESAM Data app. You can:

- **Enable/Disable** the app for all users
- **Set maintenance mode** with custom messages
- **Control features** (STK Push, SIM Toolkit, Wallet, Orders)
- **Force updates** to specific versions
- **Display announcements**

## 🚀 Setup Instructions

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `beesam-control` (or any name you prefer)
3. Make it **public** (required for raw file access)

### Step 2: Upload Control Panel Files

Upload these files to your repository:
- `index.html` - The control panel interface
- `app-config.json` - The configuration file

### Step 3: Enable GitHub Pages

1. Go to your repository **Settings**
2. Navigate to **Pages** section
3. Under "Source", select **main** branch
4. Click **Save**
5. Your control panel will be available at: `https://YOUR_USERNAME.github.io/beesam-control/`

### Step 4: Update Your App

In the file `src/context/AppControlContext.js`, update the `CONFIG_URL`:

```javascript
const CONFIG_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/beesam-control/main/app-config.json';
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## 📱 How It Works

1. The app checks the remote config every 5 minutes
2. It also checks when the app becomes visible (user switches back to it)
3. If `appEnabled` is `false`, a blocking screen appears
4. Users cannot bypass this screen - they must contact you

## 🔧 Configuration Options

| Setting | Type | Description |
|---------|------|-------------|
| `appEnabled` | boolean | Master switch - set to false to disable app |
| `message` | string | Message shown when app is disabled |
| `maintenanceMode` | boolean | Show maintenance message but app works |
| `maintenanceMessage` | string | Message for maintenance mode |
| `minVersion` | string | Minimum required app version |
| `latestVersion` | string | Latest available version |
| `forceUpdate` | boolean | Force users to update if below minVersion |
| `features.stkPush` | boolean | Enable/disable STK Push payments |
| `features.simToolkit` | boolean | Enable/disable manual USSD payments |
| `features.wallet` | boolean | Enable/disable wallet features |
| `features.orders` | boolean | Enable/disable order history |
| `contactSupport` | string | Support phone number |
| `paybillNumber` | string | M-PESA Paybill number |

## ⚡ Quick Actions

### Emergency Disable
If you need to immediately disable the app (e.g., security issue):

1. Open `app-config.json`
2. Set `"appEnabled": false`
3. Set your message
4. Commit and push

The app will be disabled for all users within 5 minutes.

### Enable App
1. Set `"appEnabled": true`
2. Set `"maintenanceMode": false`
3. Commit and push

### Maintenance Mode
1. Keep `"appEnabled": true`
2. Set `"maintenanceMode": true`
3. Update `maintenanceMessage`
4. Commit and push

## 🔐 Security Notes

- The config is fetched via HTTPS
- Cached configs expire after 24 hours
- If fetch fails, the app uses cached config or defaults (allows usage)
- Users cannot modify the remote config

## 📞 Support

For any issues, contact: 0725911246

---

**BEESAM Tech** © 2026
