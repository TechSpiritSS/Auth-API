const joi = require('joi');
require('dotenv').config();
const { v4: uuid } = require('uuid');
const { sendMail } = require('../functions/mailer');
const User = require('../models/user');

const userSchema = joi.object().keys({
  email: joi.string().email({ minDomainSegments: 2 }),
  password: joi.string().required().min(4),
  confirmPassword: joi.string().valid(joi.ref('password')).required(),
});

exports.signUp = async (req, res) => {
  try {
    const result = userSchema.validate(req.body);
    if (result.error) {
      console.log(result.error.message);
      return res.json({
        error: true,
        status: 400,
        message: result.error.message,
      });
    }
    var user = await User.findOne({
      email: result.value.email,
    });

    if (user) {
      return res.json({
        error: true,
        message: 'Email already in use',
      });
    }

    const hash = await User.hashPassword(result.value.password);
    const id = uuid();
    result.value.userId = id;

    delete result.value.confirmPassword;
    result.value.password = hash;

    let code = Math.floor(100000 + Math.random() * 900000);
    let expiry = Date.now() + 60 * 10000 * 15;

    const sendCode = await sendMail(result.value.email, code);

    if (sendCode.error) {
      return res.status(500).json({
        error: true,
        message: 'Error sending verification mail',
      });
    }

    (result.value.emailToken = code),
      (result.value.emailTokenExpires = new Date(expiry));

    const newUser = new User(result.value);
    await newUser.save();

    return res.json({
      success: true,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user', error);
    return res.status(500).json({
      error: true,
      message: "Can't Register the user",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Please enter email and password',
      });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: 'User not found',
      });
    }

    if (!user.active) {
      return res.status(400).json({
        error: true,
        message: 'Please verify your email',
      });
    }

    const match = await User.comparePasswords(password, user.password);

    if (!match) {
      return res.status(400).json({
        error: true,
        message: 'Incorrect password',
      });
    }

    await user.save();

    return res.send({
      success: true,
      message: 'User logged in successfully',
    });
  } catch (error) {
    console.log('Login Failed ', error);
    return res.status(500).json({
      error: true,
      message: "Can't login the user",
    });
  }
};

exports.activate = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({
        error: true,
        message: 'Please enter email and code',
      });
    }

    const user = await User.findOne({
      email: email,
      emailToken: code,
      emailTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: 'Invalid code',
      });
    } else {
      if (user.active) {
        return res.status(400).json({
          error: true,
          message: 'Email already verified',
        });
      }

      user.emailToken = '';
      user.emailTokenExpires = null;
      user.active = true;

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    }
  } catch (error) {
    console.log('Error verifying email', error);
    return res.status(500).json({
      error: true,
      message: "Can't verify the email",
    });
  }
};

exports.forgotPass = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        error: true,
        message: 'Please enter email',
      });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.json({
        success: true,
        message: "If user exist we'll send a mail to reset password",
      });
    }

    let code = Math.floor(100000 + Math.random() * 900000);
    let response = await sendMail(user.email, code);

    if (response.error) {
      return res.status(500).json({
        error: true,
        message: 'Error sending verification mail',
      });
    }

    let expiry = Date.now() + 60 * 10000 * 15;
    user.resetPasswordToken = code;
    user.resetPasswordExpires = new Date(expiry);

    await user.save();

    return res.json({
      success: true,
      message: 'Reset password mail sent successfully',
    });
  } catch (error) {
    console.log('Error sending reset password mail', error);
    return res.status(500).json({
      error: true,
      message: "Can't send reset password mail",
    });
  }
};

exports.resetPass = async (req, res) => {
  try {
    const { token, newPass, confirmPass } = req.body;
    if (!token || !newPass || !confirmPass) {
      return res.status(400).json({
        error: true,
        message: 'Please enter all fields',
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: 'Invalid token',
      });
    }

    if (newPass !== confirmPass) {
      return res.status(400).json({
        error: true,
        message: 'Passwords do not match',
      });
    }

    const hash = await User.hashPassword(req.body.newPass);
    user.password = hash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = '';

    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.log('Error resetting password', error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
