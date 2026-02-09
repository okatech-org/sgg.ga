import os
import ftplib
import ssl

FTP_HOST = "ftp.cluster029.hosting.ovh.net"
FTP_USER = "franciq"
FTP_PASS = "Detsadid82"
LOCAL_DIR = "dist"
REMOTE_DIR = "www/digital"

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

        # Upload .htaccess for SPA routing
        htaccess = b"""RewriteEngine On
RewriteBase /sgg/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /sgg/index.html [L]
"""
        import io
        ftp.storbinary('STOR .htaccess', io.BytesIO(htaccess))
        print("Uploaded .htaccess for SPA routing")

        # Walk through local directory
        for root, dirs, files in os.walk(LOCAL_DIR):
            # Calculate relative path from LOCAL_DIR
            rel_path = os.path.relpath(root, LOCAL_DIR)
            if rel_path == ".":
                rel_path = ""
            
            # Create remote directories
            if rel_path:
                try:
                    ftp.mkd(rel_path)
                    print(f"Created directory: {rel_path}")
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
                
                # Ensure we are in the correct directory for simple stor or use full path if server supports
                # Standard python FTP doesn't support paths in storbinary well without cwd, so let's keep it simple
                # Actually, simpler approach: Always go to root of upload dir, then try to upload
                
                print(f"Uploading {local_file_path} to {remote_file_path}...")
                with open(local_file_path, "rb") as f:
                    ftp.storbinary(f"STOR {remote_file_path}", f)

        ftp.quit()
        print("Upload completed successfully!")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_files()
