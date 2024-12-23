CREATE TABLE workspace_channels (
    channel_id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_id INT NOT NULL,
    channel_name VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
    FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id) ON DELETE CASCADE
)

