const User = require('../models/userModels');
const { findById } = require('../models/userModels');
const blog = require('../models/blogmodel');
const TPost = require('../models/textpost')
const comment = require('../models/commentModel');
const { post } = require('../routes/uswrRoute');
var FCM = require('fcm-node');
const config = require('../config');

const singlesendnotification = (registrationToken, senderdata) => {
  var serverKey = config.serverkey;
    // console.log(serverKey)
    var fcm = new FCM(serverKey);
    console.log(senderdata)
  var message = {
    to: registrationToken,
    notification: {
      title: `${senderdata.username} comment`,
      body: senderdata.content,
      icon: 'https://res.cloudinary.com/arcloud555/image/upload/v1683465039/AR_Extrabook_1_mgtmty.png',
      image: senderdata.userimage,
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

const commentblog = async (req, res) => {
  try {
    // mydeletepost ke jayesa isse banana hai
    const id = req.params.id;
    const userDatas = await blog.findById({ _id: id })
    if (userDatas) {
      const commentdata = new comment({
        content: req.body.content,
        userid: req.session.user._id,
        username: req.session.user.name,
        userimage: req.session.user.image,

        blogid: userDatas.id

      })

      const userdatas = await commentdata.save();
      // const commented = await comment.find({})
console.log("ok")
        const commented = await comment.find({})
         const usersiddata = await User.findById({_id: userDatas.userid})
         const findblogcreator = await blog.findById({_id: userdatas.blogid})
         const usernamesend = await User.findById({_id: findblogcreator.userid})
         if(usernamesend){
          let senderdata = userdatas;
          
          singlesendnotification(usernamesend.fcm_token, senderdata)
         }
         
        // if(post.length > 0){
        //   for(let i = 0; i < post.length; i++){
             
        //   }
        // }


        res.status(200).send({ user: userDatas, admin: usersiddata, userco: commented,post: userDatas,usercu: req.session.user._id })
      //  res.render('blogviews', {user: userDatas,userco: commented,post: userDatas})
    } else {
      res.status(200).send({ user: "not done"})

    }


  }
  catch (error) {
    console.log(error.message)

  }
}
const commenttextpost = async (req, res) => {
  console.log("first")
  try {
    // mydeletepost ke jayesa isse banana hai
    const id = req.params.id;
    const userDatas = await TPost.findById({ _id: id })
    if (userDatas) {
      const commentdata = new comment({
        content: req.body.content,
        userid: req.session.user._id,
        username: req.session.user.name,
        userimage: req.session.user.image,

        blogid: userDatas.id

      })

      const userdatas = await commentdata.save();
      // const commented = await comment.find({})
console.log("ok")
        const commented = await comment.find({})
         const usersiddata = await User.findById({_id: userDatas.userid})
         const findblogcreator = await blog.findById({_id: userdatas.blogid})
         const usernamesend = await User.findById({_id: findblogcreator.userid})
         if(usernamesend){
          let senderdata = userdatas;
          
          singlesendnotification(usernamesend.fcm_token, senderdata)
         }

        // if(post.length > 0){
        //   for(let i = 0; i < post.length; i++){
             
        //   }
        // }


        res.status(200).send({ user: userDatas, admin: usersiddata, userco: commented,post: userDatas,usercu: req.session.user._id })
      //  res.render('blogviews', {user: userDatas,userco: commented,post: userDatas})
    } else {
      res.status(200).send({ user: "not done"})

    }


  }
  catch (error) {
    console.log(error.message)

  }
}

const commentblogload = async (req, res) => {
  try {
    // mydeletepost ke jayesa isse banana hai
    const id = req.params.id;
    const userDatas = await comment.find({ blogid: id })
    if (userDatas) {
        res.status(200).send({ usercomment: userDatas})
      //  res.render('blogviews', {user: userDatas,userco: commented,post: userDatas})
    } else {
      res.status(200).send({ usercomment: "not work"})

    }


  }
  catch (error) {
    console.log(error.message)

  }
}


module.exports = {
  commentblog,
  commenttextpost,
  commentblogload
}
