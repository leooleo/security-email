CREATE TABLE account (
    userId SERIAL,        
    userName VARCHAR(50) UNIQUE,
    publicKey VARCHAR(3000),    
    PRIMARY KEY (userId)
);

CREATE TABLE messages (
    messageId SERIAL,
    senderId int NOT NULL,
    destinataryId int NOT NULL,
    messageSender VARCHAR(450),
    messageDestinatary VARCHAR(450),
    PRIMARY KEY (messageId),
    FOREIGN KEY (senderId) REFERENCES account(userId),
    FOREIGN KEY (destinataryId) REFERENCES account(userId)
);