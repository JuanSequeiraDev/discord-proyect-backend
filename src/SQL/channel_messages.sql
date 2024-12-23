CREATE TABLE channel_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY
    user_id INT NOT NULL,
    channel_id INT NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES workspace_channels(channel_id) ON DELETE CASCADE
)
