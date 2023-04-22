const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')

const User = require('../models/user')

const router = express.Router()

function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

router.get('/', (req, res) => {
   res.status(200).send({message: "ola mundo"})
});

router.get('/users', async (req, res) => {
   
   try{
        const data = await User.find()
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
});

router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if(await User.findOne({ email }))
            return res.status(400).send({ error: "User already exists" })

        const user = await User.create(req.body)

        user.password = undefined

        return res.send({ 
            user, 
            token : generateToken({ id: user.id }) 
        })
    }catch (err) {
        return res.status(400).send({ error: 'Registration falied' })
    }
})

router.post('/authenticate', async(req, res) =>{
    const { email, password } = req.body;

    const user = await User.findOne( { email }). select('+password')

    if(!user){
        return res.status(400).send({ error: 'User not found' })
    }       
    
    if(!await bcrypt.compare(password, user.password)){
        return res.status(400).send({ error: "Invalid password" })
    }

    user.password = undefined  
    
    res.send({ 
        user, 
        token : generateToken({ id: user.id }) 
    })
})

router.post('/forgot_password', async(req, res)=>{
    const { email } = req.body;    

    try {
       const user = await User.findOne({ email });

        if(!user){
            return res.status(400).send({ error: 'User not found' })
        }

        //geração de token
        const token = crypto.randomBytes(20).toString('hex')

        //tempo de expiração do token
        const now = new Date()
        //pega a hora de agora mais uma
        now.setHours(now.getHours() + 1)

        //alterar usuário
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            },
        })        

        mailer.sendMail({
            to: email,
            from: 'Flavio Softs ltda. <softsflavio@gmail.com>',
            subject: 'Recuperar email',
            template: 'auth/forgot_password',
            context: { token },
        }, (err) => {
            if (err){
                console.log(err)
                return res.status(400).send({ error: "Não pode enviar o email de forgot password" })
            }

            return res.send()
        })
    } catch (error) {
        
        res.status(400).send({ error: 'Esso no forgot password, tente novamente'})
    }
})

router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email })
      .select('+passwordResetToken passwordResetExpires');

    if (!user)
      return res.status(400).send({ error: 'User not found' });

    if (token !== user.passwordResetToken)
      return res.status(400).send({ error: 'Token is not valid' });

    const now = new Date();

    if (now > user.passwordResetExpires)
      return res.status(400).send({ error: 'Token expired, generate a new one' });

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.password = password;

    await user.save();

    res.send();
  } catch (err) {
    res.status(400).send({ error: 'Cannot reset password, try again' });
  }
});

module.exports = app => app.use('/auth', router)

