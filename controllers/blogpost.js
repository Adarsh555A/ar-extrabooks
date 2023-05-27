const User = require('../models/userModels');
const { findById, updateOne } = require('../models/userModels');
// const { name } = require('ejs');
const blog = require('../models/blogmodel');
const comment = require('../models/commentModel');
const Tpost = require('../models/textpost')
const { post, all } = require('../routes/uswrRoute');
const { Cookie } = require('express-session');
var FCM = require('fcm-node');
const config = require('../config');

// const cloudinary = require('./cloudinary')
const uploadblogload = async (req, res) => {
    try {
        const id = req.session.user._id;
        const userDatas = await User.findById({ _id: id })
        if (userDatas) {
          res.status(200).send({ user: userDatas })
        } else {
          res.status(200).send({ message: "error" })
        }
    
    }
    catch (error) {
      console.log(error.message)
  
    }
  }
  const singlesendnotification = (registrationToken, creator) => {
    var serverKey = config.serverkey;
      // console.log(serverKey)
      var fcm = new FCM(serverKey);
    var message = {
      to: registrationToken,
      notification: {
        title: `${creator.name} is upload new post.`,
        body: `${creator.location}`,
        icon : creator.image,

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
  const mutiplesendnotification = (registrationmulToken, creator) => {
    var serverKey = config.serverkey;
    // console.log(serverKey)
    var fcm = new FCM(serverKey);
    var pushMessage = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      registration_ids:registrationmulToken,
      content_available: true,
      mutable_content: true,
      notification: {
          body: `${creator.name} is upload new post.`,
          icon : creator.image,//Default Icon
          sound : 'mySound',
          //Default sound
          // badge: badgeCount, example:1 or 2 or 3 or etc....
      },
      // data: {
      //   notification_type: 5,
      //   conversation_id:inputs.user_id,
      // }
    };
  
    fcm.send(pushMessage, function(err, response){
        if (err) {
            console.log("Something has gone wrong!",err);
        } else {
            console.log("Push notification sent.", response);
        }
    });
  
     
  }
  
  const uploadblog = async (req, res) => {
    try {
        const id = req.session.user._id;
        const userDatas = await User.findById({ _id: id })
        if (userDatas) {
       console.log("first")
        const Blog = new blog({
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
            userid: req.body.userid,
            username: req.body.username,

          })
          const userdatas = await Blog.save();
          res.status(200).send({ message: 'Post Successfully!' })
          const creatoridpost = userdatas.userid;
          const creatorfollowers = await User.findById({ _id: creatoridpost })
          if (creatorfollowers) {
            const allusersdata = await User.find({ _id: { $in: creatorfollowers.followers } });
            // const allusersdata = await User.find({ _id: { $in: creatorfollowers.followers } });
            var reg_ids = [];
            allusersdata.forEach(token => {
              if (token.fcm_token === '') { }
              else {
                reg_ids.push(token.fcm_token)
              }
            })
            const userfollowfcm = reg_ids;
    
            if (userfollowfcm.length === 1) {
              console.log(userfollowfcm)
              const fcm_token_user = userfollowfcm[0];
    
              singlesendnotification(fcm_token_user, creatorfollowers)
             
    
            } else {
                 mutiplesendnotification(userfollowfcm, creatorfollowers)
    
            }
    
          } else {
            console.log("first")
          }
    
    

        } else {
          res.status(200).send({ message: 'Post unSuccessfully!' })
          }
  
          }
    catch (error) {
      console.log(error.message)
  
    }
  }
  const blogsload = async (req, res) => {
    try {
        // const id = req.query.id;
        const post = await blog.find({})
        // const userDatas = await User.findById({ _id: id })
        // if (userDatas) {
          res.status(200).send({post: post, userli: req.session.user._id})
        // } else {
        //   res.redirect('/')
        // }
    
    }
    catch (error) {
      console.log(error.message)
  
    }
  }
  const myblogsload = async (req, res) => {
    try {
        const id = req.session.user._id;
        const userDatas = await User.findById({ _id: id })
        if (userDatas) {
          const post = await blog.find({userid: userDatas._id})

          res.status(200).send({ post: post})
        } else {
          res.status(200).send({ post: "post"})
        }
    
    }
    catch (error) {
      console.log(error.message)
  
    }
  }
  const editblogload = async (req, res) => {
    try {
        const id = req.params.id;
        const userDatas = await blog.findById({ _id: id })
        if (userDatas) {
          res.status(200).send({ post: userDatas })
        } else {
          res.status(200).send({ post: "userDatas" })
        }
    
    }
    catch (error) {
      console.log(error.message)
  
    }
  }
const editblog = async(req, res) => {
  try {
     if(req.body.title){
      const filetext = await blog.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { title: req.body.title} })}
      else if(req.body.description){
        const filetext = await blog.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { description: req.body.description } })}
      else if(req.body.image){
        const filetext = await blog.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { image: req.body.image } })
      }
console.log("working")

  } catch (error) {
    console.log(error.message)
  }
}
const mydeleteblogs = async(req, res) => {
  try {
    const id = req.params.id;
    // const blogimage = await blog.findById(req.params.id)
    // const imgid = 
    const userDatas = await blog.deleteOne({ _id: id })
    const deletecomments = await comment.deleteMany({blogid: id})
    if (userDatas) {
      res.status(200).send({ post: "Deleted" })
    } else {
      console.log("not deleted")
    }
  } catch (error) {
    console.log(error.message)
  }
}
const likeblog = async (req, res) => {
  try {
      const id = req.params.id;
      await blog.findByIdAndUpdate(id, { $push: { like: req.session.user._id } })
      const userDatas = await blog.findById({ _id: id })

        res.status(200).send({ user: "Like", result: userDatas})
  }
  catch (error) {
    console.log(error.message)

  }
}
const unlikeblog = async (req, res) => {
  try {
      const id = req.params.id;
      await blog.findByIdAndUpdate(id, { $pull: { like: req.session.user._id } })
      const userDatas = await blog.findById({ _id: id })

        res.status(200).send({ user: "unlike", result: userDatas})
  }
  catch (error) {
    console.log(error.message)

  }
}

const rewardload = async(req, res) =>{
  try {
    const myposts = await blog.find({userid:req.session.user._id})
    const mytpost = await Tpost.find({userid:req.session.user._id})

    function getlikedblogSum(a){

      var total=0;
  
      for(var i in a) { 
  
          total += a[i].like.length;
  
      }
  
      return total;
  
  }
  
  
  
  var payChecks = myposts; 
  
  var weeklyPay= getlikedblogSum(payChecks);
  
  
  function getlikedpostSum(a){

    var posttotal=0;

    for(var i in a) { 

        posttotal += a[i].like.length;

    }

    return posttotal;

}



var bloglikedarray = mytpost; 

var postlikedtotal = getlikedpostSum(bloglikedarray);//sums up to 722
let totallike = weeklyPay + postlikedtotal;
  //  var alllikes = 0;
  //   for (let i = 0; i < myposts.length; i++) {
  //     let Num = Number(myposts[i].like.length)
  //     var g =+ Num
  //     console.log(g)

  //   } 
  //   console.log(alllikes + " Likes")
    res.status(200).send({ user: totallike})

  } catch (error) {
    console.error(error);
    res.status(200).send({ user: "error"})

  }
}

const blogview = async (req, res) => {
  try {
      const id = req.params.id;
      const post = await blog.findById(id)
      const userdata = await User.findById(post.userid)
      // const userDatas = await User.findById({ _id: id })
      // if (userDatas) {
        res.status(200).send({post: post, userli: req.session.user._id,creator:userdata})
      // } else {
      //   res.redirect('/')
      // }
  
  }
  catch (error) {
    console.log(error.message)

  }
}
const searchblogs = async(req, res) => {
  try {
    const allblogs = await blog.find({})
    res.status(200).send({ blog: allblogs })

  } catch (error) {
    console.error(error);
    res.status(200).send({ blog: "error" })

  }
}


// Text post Section
const textpostload = async (req, res) => {
  try {
      // const id = req.query.id;
      const post = await Tpost.find({})
      
      // if (userDatas) {
        res.status(200).send({post: post, userli: req.session.user._id})
      // } else {
      //   res.redirect('/')
      // }
  
  }
  catch (error) {
    console.log(error.message)

  }
}
const uploadtextpostload = async (req, res) => {
  try {
      const id = req.session.user._id;
      const userDatas = await User.findById({ _id: id })
      if (userDatas) {
        res.status(200).send({ user: userDatas })
      } else {
        res.status(200).send({ message: "error" })
      }
  
  }
  catch (error) {
    console.log(error.message)

  }
}

const uploadtpost = async (req, res) => {
  try {
      const id = req.session.user._id;
      const userDatas = await User.findById({ _id: id })
      if (userDatas) {
     console.log("first")
      const TPost = new Tpost({
          question: req.body.question,
          answer: req.body.answer,
          userid: req.body.userid,
          username: req.body.username,
          userimage: req.body.userimage

        })
        const userdatas = await TPost.save();
        console.log("second")
        res.status(200).send({ message: 'Post Successfully!' })
        const creatoridpost = userdatas.userid;
        const creatorfollowers = await User.findById({ _id: creatoridpost })
        if (creatorfollowers) {
          const allusersdata = await User.find({ _id: { $in: creatorfollowers.followers } });
          // const allusersdata = await User.find({ _id: { $in: creatorfollowers.followers } });
          var reg_ids = [];
          allusersdata.forEach(token => {
            if (token.fcm_token === '') { }
            else {
              reg_ids.push(token.fcm_token)
            }
          })
          const userfollowfcm = reg_ids;
  
          if (userfollowfcm.length === 1) {
            console.log(userfollowfcm)
            const fcm_token_user = userfollowfcm[0];
  
            singlesendnotification(fcm_token_user, creatorfollowers)
           
  
          } else {
               mutiplesendnotification(userfollowfcm, creatorfollowers)
  
          }
  
        } else {
          console.log("name not exist")
        }
  
  

      } else {
        res.status(200).send({ message: 'Post unSuccessfully!' })
        }

        }
  catch (error) {
    console.log(error.message)

  }
}
const mytextpostload = async (req, res) => {
  try {
      const id = req.session.user._id;
      const userDatas = await User.findById({ _id: id })
      if (userDatas) {
        const post = await Tpost.find({userid: userDatas._id})
        const userdata = await User.findById(post.userid)

        res.status(200).send({ post: post, creator:userdata})
      } else {
        res.status(200).send({ post: "post"})
      }
  
  }
  catch (error) {
    console.log(error.message)

  }
}

const mydeletetextpost = async(req, res) => {
  try {
    const id = req.params.id;
    // const blogimage = await blog.findById(req.params.id)
    // const imgid = 
    const userDatas = await Tpost.deleteOne({ _id: id })
    const deletecomments = await comment.deleteMany({blogid: id})

    if (userDatas) {
      res.status(200).send({ post: "Deleted" })
    } else {
      console.log("not deleted")
    }
  } catch (error) {
    console.log(error.message)
  }
}
const liketextpost = async (req, res) => {
  try {
      const id = req.params.id;
      await Tpost.findByIdAndUpdate(id, { $push: { like: req.session.user._id } })
      const userDatas = await Tpost.findById({ _id: id })

        res.status(200).send({ user: "Like", result: userDatas})
  }
  catch (error) {
    console.log(error.message)

  }
}
const unliketextpost = async (req, res) => {
  try {
      const id = req.params.id;
      await Tpost.findByIdAndUpdate(id, { $pull: { like: req.session.user._id } })
      const userDatas = await Tpost.findById({ _id: id })

        res.status(200).send({ user: "unlike", result: userDatas})
  }
  catch (error) {
    console.log(error.message)

  }
}

const textpostview = async (req, res) => {
  try {
      const id = req.params.id;
      const post = await Tpost.findById(id)
      const userdata = await User.findById(post.userid)
    
      // const userDatas = await User.findById({ _id: id })
      // if (userDatas) {
        res.status(200).send({post: post, userli: req.session.user._id,creator:userdata})
      // } else {
      //   res.redirect('/')
      // }
  
  }
  catch (error) {
    console.log(error.message)

  }
}


  module.exports = {
    uploadblogload,
    uploadblog,
    blogsload,
    myblogsload,
    editblogload,
    editblog,
    mydeleteblogs,
    likeblog,
    unlikeblog,
    rewardload,
    blogview,
    searchblogs,
    textpostload,
    uploadtpost,
    textpostload,
    mytextpostload,
    mydeletetextpost,
    liketextpost,
    unliketextpost,
    textpostview,
    uploadtextpostload
  }
  