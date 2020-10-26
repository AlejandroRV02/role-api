const express = require('express');
const app = express();


const cors = require('cors');
const bodyparser = require('body-parser');

const passport = require('passport');

//Consola
const {success, error} = require('consola');

//Constants
const {DB, PORT} = require('./config/index');

//Connection to DB
const {connect} = require('mongoose');


//Middlewares
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(cors());
app.use(passport.initialize());

require('./middlewares/passport')(passport);

//User router middlewares
app.use('/api/user', require('./routes/user'));


//Starting the app
const startApp = async () => {

    try {
        
        await connect(DB, {useNewUrlParser: true, useUnifiedTopology:true})
        success({message: `DB connected`,badge: true})
    
        app.listen(PORT, () => {
            success({
                message: `Server on port ${PORT}`,
                badge: true
            })
        }) 
    } catch (err) {
        error({message:`Unable to connect to the DB: ${err}`,badge: true });
        startApp();
    }
    
}

startApp();