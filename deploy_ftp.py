import os
import ftplib

FTP_HOST = "ftp.cluster029.hosting.ovh.net"
FTP_USER = "franciq"
FTP_PASS = "Detsadid82"
LOCAL_DIR = "dist"
REMOTE_DIR = "sgg"

def upload_files():
    try:
        # Connect to FTP
        ftp = ftplib.FTP(FTP_HOST, timeout=30)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        print(f"Connected to {FTP_HOST}")

        # Create/Enter remote root directory
        try:
            ftp.mkd(REMOTE_DIR)
            print(f"Created remote directory: {REMOTE_DIR}")
        except ftplib.error_perm:
            print(f"Remote directory {REMOTE_DIR} likely exists")

        ftp.cwd(REMOTE_DIR)
        print(f"Changed to remote directory: {REMOTE_DIR}")

        # Clean remote directory first (remove old assets)
        try:
            clean_remote(ftp, "assets")
            print("Cleaned old assets directory")
        except Exception as e:
            print(f"Note: Could not clean assets dir: {e}")

        # Upload .htaccess for SPA routing
        # sgg.ntsagui.com maps to /sgg/ on the server,
        # so RewriteBase should be / for the subdomain
        htaccess = b"""RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
"""
        import io
        ftp.storbinary('STOR .htaccess', io.BytesIO(htaccess))
        print("Uploaded .htaccess for SPA routing (subdomain mode)")

        # Walk through local directory
        for root, dirs, files in os.walk(LOCAL_DIR):
            # Calculate relative path from LOCAL_DIR
            rel_path = os.path.relpath(root, LOCAL_DIR)
            if rel_path == ".":
                rel_path = ""
            
            # Create remote directories
            if rel_path:
                parts = rel_path.split(os.sep)
                current = ""
                for part in parts:
                    current = f"{current}/{part}" if current else part
                    try:
                        ftp.mkd(current)
                        print(f"Created directory: {current}")
                    except ftplib.error_perm:
                        pass # Directory likely exists

            # Upload files
            for file in files:
                local_file_path = os.path.join(root, file)
                
                # Determine remote file path
                if rel_path:
                    remote_file_path = f"{rel_path}/{file}"
                else:
                    remote_file_path = file
                
                print(f"Uploading {local_file_path} to {remote_file_path}...")
                with open(local_file_path, "rb") as f:
                    ftp.storbinary(f"STOR {remote_file_path}", f)

        ftp.quit()
        print("")
        print("=" * 50)
        print("  ✅ DEPLOYMENT COMPLETED SUCCESSFULLY")
        print("  URL: https://sgg.ntsagui.com/")
        print("=" * 50)

    except Exception as e:
        print(f"Error: {e}")


def clean_remote(ftp, dir_name):
    """Recursively remove contents of a remote directory."""
    try:
        ftp.cwd(dir_name)
    except ftplib.error_perm:
        return  # Directory doesn't exist
    
    entries = []
    ftp.retrlines('LIST', entries.append)
    
    for entry in entries:
        parts = entry.split(None, 8)
        if len(parts) < 9:
            continue
        name = parts[8]
        if name in ('.', '..'):
            continue
        
        if entry.startswith('d'):
            clean_remote(ftp, name)
            try:
                ftp.rmd(name)
            except:
                pass
        else:
            try:
                ftp.delete(name)
            except:
                pass
    
    ftp.cwd('..')


if __name__ == "__main__":
    upload_files()
