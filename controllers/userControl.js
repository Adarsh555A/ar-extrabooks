const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
const { findById } = require('../models/userModels');
const randomstring = require('randomstring')
const config = require('../config');
const blog = require('../models/blogmodel');
const Chat = require('../models/chatModel')
const { emailUser, pass, passuserd } = require('../config');
const { all } = require('../routes/uswrRoute');
const Tpost = require('../models/textpost')
var FCM = require('fcm-node');

// joh bhi user [http://127.0.0.1:5500/register] pe jayega usse register.ejs par le jayega
const registerload = async (req, res) => {
  try {
    res.status(200).send('register')
  }
  catch (err) {
    console.log(err.message)
  }
}


// for user verify
// yeh code admin ke gmail se user ke gmail par ek mail send karega aur jaise hi user send kiye gaye mail undar bheja gaya link jaise hi click karega user vaise hi vah redirect ho jayega dusre kisi page par
// {warning} hume humesa position yaad rakhna hoga taki data's ulta pulta na jaye
const senndVerifymail = async (name, email, user_id) => {
  try {
    const transporter = await nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.passuserd
      }
    })
    const mailoption = {
      from: config.emailUser,
      to: email,
      subject: 'for verification mail',
      html: `<p> Hii ${name} please click on this link for verify your mail <a href="https://x6v4mq-5500.csb.app/checkmail/${user_id}">Verify</a> now.</p>`
    }
    transporter.sendMail(mailoption, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log("Email has been sended - ", info.response)
      }
    })
  } catch (error) {
    console.log(error.message)
  }

}

//for reset password mail
const senndResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = await nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.passuserd
      }
    })
    const mailoption = {
      from: config.emailUser,
      to: email,
      subject: 'for reset password mail',
      html: `<p> Hii ${name} Ar is send mail to reset password <a href="https://x6v4mq-5500.csb.app/forget-password/${token}">Reset </a> your password.</p>`
    }
    transporter.sendMail(mailoption, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log("Email has been sended - ", info.response)
      }
    })
  } catch (error) {
    console.log(error.message)
  }

}

const singlesendnotification = (registrationToken, senderdata) => {
  var serverKey = config.serverkey;
    // console.log(serverKey)
    var fcm = new FCM(serverKey);
  var message = {
    to: registrationToken,
    notification: {
      title: `${senderdata.name} starting follow you`,
      body: `${senderdata.location}`,
      icon: 'https://res.cloudinary.com/arcloud555/image/upload/v1683465039/AR_Extrabook_1_mgtmty.png',
      image: senderdata.image,
      click_action: `https://x6v4mq-5500.csb.app/profile/${senderdata.id}`,
      redirect: `https://x6v4mq-5500.csb.app/profile/${senderdata.id}`
    },

    data: { //you can send only notification or only data(or include both)
      title: 'ok cdfsdsdfsd',
      body: '{"name" : "okg ooggle ogrlrl","product_id" : "123","final_price" : "0.00035"}'
    }

  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!" + err);
      console.log("Respponse:! " + response);
    } else {
      // showToast("Successfully sent with response");
      console.log("Successfully sent with response: ", response);
    }

  });

}


const register = async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.image || !req.body.password) {
      return res.status(200).send({ message: 'unfilled' })
    }
    const passwordhash = await bcrypt.hash(req.body.password, 10);

    await User.findOne({ $or: [{ email: req.body.email }, { name: req.body.name }] }).then((savedUser) => {
      if (savedUser) {
        return res.status(200).send({ message: "Already" })

      }
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
        password: passwordhash

      })
      const userdatas = user.save();
      // hume humesa position yaad rakhna hoga taki data's ulta pulta na jaye
      senndVerifymail(req.body.name, req.body.email, userdatas._id);
      res.status(200).send({ message: 'Resgistration' })

    })
  }
  catch (err) {
    console.log(err.message + "ggg")
  }
}
const googleauthi = async (req, res) => {
  try {
    // console.log(req.userData + "ji")
    // console.log(req.session.userData)
    let data = req.user;
    if(data.is_verified === '0'){
    const updateddata = await User.findByIdAndUpdate({ _id: data._id }, { $set: { is_verified: "1"} })
    }
     req.session.user = data;
     res.redirect('/home');
  } catch (error) {
    console.error(error);
  }
}

const loadLogin = async (req, res) => {
  try {
    res.status(200).send({ message: "login" })
  } catch (error) {
    console.log(error.message)
  }
}
const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    // agar email correct hai toh password check karo varna else ka message chala do 
    if (userData) {
      // agar Password correct hai toh dashboard namak function par redirect kar do varna else ka message chala do
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        req.session.user = userData;
        res.status(200).send({ message: "Successfull" })

      } else {
        res.status(200).send({ message: "Wrong" })
      }
    }
    else {
      res.status(200).send({ message: "Wrong" })
    }
  } catch (error) {
    res.status(400).send({ message: "Wrong" })
  }
}

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).send({ message: "Logout" })


  } catch (error) {
    console.log(error.message)
  }
}
const loaddashboard = async (req, res) => {
  try {
    // const userdata = await User.findById({_id: req.session.user._id})
    const post = await blog.find({ userid: req.session.user._id })
    const text = await Tpost.find({ userid: req.session.user._id })
    if (post) {
      var totalviewscount = 0;

      for (let i = 0; i < post.length; i++) {
        var counterviews = post[i]['like']
        var viewcountnum = Number(counterviews);

        totalviewscount += viewcountnum;
      }
      // console.log(totalviewscount)
    }
    var postcount = post.length;
    var textcount = text.length;
    var posts = postcount + textcount;
    const allfollowingconut = await User.findById({ _id: req.session.user._id })
    // console.log(allfollowingconut.following.length)

    res.status(200).send({ user: allfollowingconut, totalposts: posts })
  } catch (error) {
    res.status(200).send({ user: "error" })
    console.log(error.message)
  }
}
const loadedit = async (req, res) => {
  try {
    res.status(200).send({ messages: "userDatas" })

  }
  catch (err) {
    console.log(err.message)
  }
}
const editprofile = async (req, res) => {
  try {
    console.log("first")
    if (req.body.name && req.body.user_id) {
      const savedUser = await User.findOne({ name: req.body.name })

      if (!savedUser) {


        const filetext = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name } })
      } else {
        res.status(200).send({ message: "Already" })

      }
    }
    else if (req.body.email) {
      const EsavedUser = await User.findOne({ email: req.body.email })

      if (!EsavedUser) {


        const filetext = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { email: req.body.email } })
      }
      else {
        res.status(200).send({ message: "Already" })

      }

    } else if (req.body.image) {
      const filetext = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { image: req.body.image } })

    }
    // res.redirect('/')
  } catch (error) {
    console.log(error.message + "yt7rrgggggggggggggggggggggggggggggggggggggg")
  }
}
// jaise hi url[http://127.0.0.1:5500/verify?id=${user_id}] par id aye verify hone ke liye tab uski id lekar check karke is_verifed par 0 ko hata kar 1 dal do
const verifymail = async (req, res) => {
  try {
    const updatedinfov = await User.updateOne({ _id: req.params.id }, { $set: { is_verified: 1 } })
    const checkid = await User.findById({ _id: req.params.id })
    console.log(req.params.id)
    console.log(checkid.name)
    res.status(200).send({ message: "email-verified" })
  } catch (error) {
    console.log(error.message)
  }
}

const forgetload = async (req, res) => {
  try {
    res.status(200).send('forget')
  } catch (error) {
    console.log(error.message)
  }
}
const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userDatal = await User.findOne({ email: email })
    if (userDatal) {
      // random string ko install karna jaruri hai--------------------------------------------------------------
      if (userDatal.is_verified === "0") {
        res.status(200).send({ message: 'Please verify your gmail.' })
      } else {
        const randomString = randomstring.generate();
        const updated = await User.updateOne({ email: email }, { $set: { token: randomString } });
        senndResetPasswordMail(userDatal.name, userDatal.email, randomString)
        res.status(200).send({ message: 'Please check your mail for reset your password.' })

      }
    } else {
      res.status(200).send({ message: "user email is incorrect." })
    }
  } catch (error) {
    console.log(error.message)
  }
}
const forgetPasswordload = async (req, res) => {
  try {
    const token = req.params.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.status(200).send({ user_id: tokenData._id })
    } else {
      res.status(400).send({ message: "Token is invalid." })
    }
  } catch (error) {
    console.log(error.message)
  }
}
const forgetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const secure_password = await bcrypt.hash(password, 10);
    const updateddata = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } })
    res.status(200).send({ message: "Successfull" })
  } catch (error) {
    console.log(error.message)
  }
}
const verificationload = async (req, res) => {
  try {
    res.status(200).send('verification')
  }
  catch (error) {
    console.log(error.message)

  }
}
const verification = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email })
    if (userData) {
      senndVerifymail(userData.name, userData.email, userData._id)
      res.status(200).send({ message: "Please reset your mail verification check it." })
    } else {
      res.status(200).send({ message: "The mail is not exist." })
    }
  }
  catch (error) {
    console.log(error.message)

  }
}
const userviewsload = async (req, res) => {
  try {
    var users = await User.find({ _id: { $nin: [req.session.user._id] } });
    const allusersdata = await User.find({ _id: { $in: req.session.user.following } });

    res.status(200).send({ user: req.session.user, users: users, userf: allusersdata })
  } catch (error) {
    console.log(error.message)

  }
}
const profileload = async (req, res) => {
  try {
    const id = req.params.id;
    const userDatas = await User.findById({ _id: id })
    if (userDatas) {
      const post = await blog.find({ userid: userDatas._id })
      const text = await Tpost.find({ userid: userDatas._id })
      var postcount = post.length;
      var textcount = text.length;
      var posts = postcount + textcount;
      // realtime result ke liye findbyid kar vaya
      // const userDatasc = await User.findById({ _id: req.session.user._id })
      // console.log(userDatasc.following)
      // const allusersdata = await User.find({ _id: { $in: userDatasc.following } });

      // for (let i = 0; i < allusersdata.length; i++) {
      //   var kd = allusersdata[i]['_id'] + "id";
      //   var rd = userDatas._id + "id";
      //   var result;
      //   if (rd == kd) {
      //     result = "yes"
      //     console.log(result)
      //   }
      //   else if (rd !== kd) {
      //   }
      //   else {
      //     console.log(allusersdata[1]['_id'] + "id")
      //     console.log(userDatas._id + "id")
      //   }
      // }
      // console.log(result)
      const allfollowingconut = await User.findById({ _id: req.session.user._id })
      // console.log(allfollowingconut.following.length)

      res.status(200).send({ user: userDatas, post: post, userfwc: allfollowingconut, tpost: text, totalposts: posts })
    } else {
      res.status(200).send({ user: "error" })
    }
  } catch (error) {
    res.status(200).send({ user: "error" })
  }
}
const followpush = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.body.followId, { $push: { followers: req.session.user._id } })
    await User.findByIdAndUpdate(req.session.user._id, { $push: { following: req.body.followId } })
    const userDatas = await User.findById({ _id: req.body.followId })
    if (userDatas) {
      const followeduser = req.session.user;
      singlesendnotification(userDatas.fcm_token, followeduser)
    }

    // const id = req.query.id;
    // const userDatas = await User.findById({ _id: id })

    // // res.status(200).send({success: true})

    // if (userDatas) {
    //   const post = await blog.find({})
    //   // realtime result ke liye findbyid kar vaya
    //   const userDatasc = await User.findById({ _id: req.session.user._id })
    //   console.log(userDatasc.following)
    //   const allusersdata = await User.find({ _id: { $in: userDatasc.following } });

    //   for (let i = 0; i < allusersdata.length; i++) {
    //     var kd = allusersdata[i]['_id'] + "id";
    //     var rd = userDatas._id + "id";
    //     var result;
    //     if (rd == kd) {
    //       result = "yes"
    //       console.log(result)
    //     }
    //     else if (rd !== kd) {
    //     }
    //     else {
    //       console.log(allusersdata[1]['_id'] + "id")
    //       console.log(userDatas._id + "id")
    //     }
    //   }
    //   console.log(result)
    //   const allfollowingconut = await User.findById({ _id: userDatas._id })
    //   // console.log(allfollowingconut.following.length)
    res.status(200).send({ message: "Follow" })
    // res.render('profile', { user: userDatas, post: post,userf: allusersdata,results: result,userfwc: allfollowingconut})
    // } else {
    //   res.status(200).send({ message: "error" })
    // }

  } catch (error) {
    res.status(200).send({ message: "error" })

    console.log(error)
  }
}
const following = async (req, res) => {
  try {
    const id = req.params.id;
    const userDatas = await User.findById({ _id: id })

    const allusersdata = await User.find({ _id: { $in: userDatas.following } });
    let followingpo = 1;
    res.status(200).send({ users: allusersdata, userc: req.session.user._id, followingpost: followingpo })

  } catch (error) {
    res.status(200).send({ user: "error" })

  }
}
const follower = async (req, res) => {
  try {
    const id = req.params.id;
    const userDatas = await User.findById({ _id: id })

    const allusersdata = await User.find({ _id: { $in: userDatas.followers } });
    // isse unfollow button nahi show karega 
    let followingpo = 0;

    res.status(200).send({ users: allusersdata, userc: req.session.user._id, followingpost: followingpo })

  } catch (error) {
    res.status(200).send({ user: "error" })

    console.log(error)
  }
}
const followpull = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.body.followId, { $pull: { followers: req.session.user._id } })
    await User.findByIdAndUpdate(req.session.user._id, { $pull: { following: req.body.followId } })
    // const id = req.query.id;
    // const userDatas = await User.findById({ _id: id })

    // const allusersdata = await User.find({ _id: { $in: userDatas.following } });
    // let followingpo = 1;
    // res.render('follow', {users: allusersdata,userc: req.session.user._id, followingpost: followingpo})
    res.status(200).send({ message: "Unfollow" })

  } catch (error) {
    res.status(200).send({ message: "error" })
  }
}
const followingposts = async (req, res) => {
  try {
    const id = req.session.user._id;
    const userDatas = await User.findById({ _id: id })
    const post = await blog.find({ userid: { $in: userDatas.following } })
    // var post1 = []
    // post1 = post
    //     var tpost = await Tpost.find({ userid: { $in: userDatas.following } })
    //     post1 = post1.concat(tpost);

    // // console.log(post1.sort())
    //      let followingposts = post1.sort();
    const allusersdata = await User.find({ _id: { $in: userDatas.following } });
    let followingpo = 1;
    res.status(200).send({ users: allusersdata, userc: req.session.user._id, post: post })

  } catch (error) {
    console.log(error)
  }
}
const Savechat = async (req, res) => {
  try {
    const id = req.params.id;
    var chat = new Chat({
      sender_id: req.session.user._id,
      receiver_id: id,
      message: req.body.message
    })
    var newChat = await chat.save();
    res.status(200).send({ success: true, msg: 'chat inserted', data: newChat })

  } catch (error) {
    res.status(400).send({ success: false, msg: error.message })
    console.log(error.message)

  }
}
const Savechatload = async (req, res) => {
  try {
    const id = req.params.id;
    var chats = await Chat.find({
      $or: [{ sender_id: req.session.user._id, receiver_id: id },
      { sender_id: id, receiver_id: req.session.user._id }]
    })  // console.log(userchat)
    res.status(200).send({ success: true, chat: chats, sender_id: req.session.user._id })

  } catch (error) {
    res.status(200).send({ success: false, msg: error.message })
    console.log(error.message)

  }
}
const deletechatload = async (req, res) => {
  try {
    const id = req.params.id;
    var detelechats = await Chat.findByIdAndDelete({ _id: id })
    if (detelechats) {
      res.status(200).send({ success: true, message: "deleted successfuly" })

    } else {
      res.status(200).send({ success: true, message: "deleted unsuccessfuly" })

    }

  } catch (error) {
    res.status(200).send({ success: false, msg: error.message })
    console.log(error.message)

  }
}
const searchusers = async (req, res) => {
  try {
    const allusers = await User.find({})
    res.status(200).send({ user: allusers })

  } catch (error) {
    console.error(error);
    res.status(200).send({ user: "error" })

  }
}
const location = async (req, res) => {
  try {
    if (req.body.location && req.body.user_id) {
      const location = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { location: req.body.location } })
      res.status(200).send({ message: "success" })

    }

    // res.redirect('/')
  } catch (error) {
    console.log(error.message + "error")
  }
}
const notification = async (req, res) => {
  try {
    if (req.body.userid && req.body.fcm_token) {
      const notification = await User.findByIdAndUpdate({ _id: req.body.userid }, { $set: { fcm_token: req.body.fcm_token } })
    }

    // res.redirect('/')
  } catch (error) {
    console.log(error.message + "yt7rrgggggggggggggggggggggggggggggggggggggg")
  }
}


module.exports = {
  registerload,
  register,
  loadLogin,
  login,
  logout,
  loaddashboard,
  loadedit,
  editprofile,
  verifymail,
  forgetload,
  forgetVerify,
  forgetPasswordload,
  forgetPassword,
  verificationload,
  verification,
  userviewsload,
  profileload,
  followpush,
  following,
  follower,
  followpull,
  followingposts,
  Savechat,
  Savechatload,
  deletechatload,
  searchusers,
  location,
  notification,
  googleauthi
}