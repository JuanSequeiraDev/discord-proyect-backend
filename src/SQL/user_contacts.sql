
CREATE TABLE user_contacts(
    chat_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL ,
    user_contact_id INT NOT NULL ,
    activo BOOLEAN DEFAULT TRUE,
    creado_en DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user_contact_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, user_contact_id)
)