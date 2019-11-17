const { Client } = require('pg')


class dataBaseWrapper {

    async connect() {
        await this.client.connect()
        console.log('Connected!')
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
            
            var res = await this.client.query(`select publickey from account publicKey where username = '${username}';`)
            return res.rows[0]['publickey'];
        } catch (error) {
            return null;
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