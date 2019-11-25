const { Client } = require('pg')


class dataBaseWrapper {

    async connect() {
        await this.client.connect()
        console.log('Database connected')
    }

    async insertUser(username, puk) {
        try {
            puk = puk.replace(/\r?\n|\r/g, " ");
            // console.log(`insert into account(userName, publicKey) values ('${username}', '${puk}');`);
            this.client.query(`insert into account(userName, publicKey) values ('${username}', '${puk}');`)
            return true;
        } catch (error) {
            return false;
        }
    }

    async userExists(username) {
        try {
            var res = await this.client.query(`select * from account where username = '${username}';`)
            return res.rowCount == 1;
        } catch (error) {
            return null;
        }
    }

    async getUserKey(username) {
        try {
            var res = await this.client.query(`select publickey from account where username = '${username}';`)
            return res.rows[0]['publickey'];
        } catch (error) {
            return null;
        }
    }

    async getUserName(id) {
        try {
            var res = await this.client.query(`select username from account where userid = ${id};`)
            return res.rows[0]['username'];
        } catch (error) {
            return null;
        }
    }

    async getUserId(username) {
        try {
            var res = await this.client.query(`select userid from account where username = '${username}';`)
            return res.rows[0]['userid'];
        } catch (error) {
            return null;
        }
    }

    async insertMessage(sender, destinatary, messageSender, messageDestinatary) {
        var senderId = await this.getUserId(sender)
        var destinataryId = await this.getUserId(destinatary)

        try {
            await this.client.query(`insert into messages( senderid, destinataryid, messagesender, messagedestinatary) values('${senderId}','${destinataryId}','${messageSender}','${messageDestinatary}');`)
            return true
        } catch (error) {
            return false
        }
    }

    async getArrivedMessages(userId) {
        try {
            var res = await this.client.query(`select senderid, messagedestinatary from messages where destinataryid = ${userId};`)
            return res.rows
        } catch (error) {
            console.log(error);
            return null
        }
    }

    async getSentMessages(userId) {
        try {
            var res = await this.client.query(`select destinataryid, messagesender from messages where senderid = ${userId};`)
            return res.rows
        } catch (error) {
            console.log(error);
            return null
        }
    }

    constructor() {
        this.client = new Client(
            {
                connectionString: 'postgres://yfsyyenmetcyyj:c70182062572ae779ac98b9940880494051e6ac3f2e47bc4837e3fccd4ad9173@ec2-107-21-111-24.compute-1.amazonaws.com:5432/dfomhnu2f46dhl',
                ssl: true,
            }
        );
    }


}

module.exports.dataBaseWrapper = dataBaseWrapper;