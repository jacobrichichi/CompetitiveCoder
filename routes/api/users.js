const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// Load User model
const User = require("../../models/User");
const Challenge = require("../../models/Challenge");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
    // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return res.status(400).json({ email: "Email already exists" });
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          rank: 450,
          isCoolDown: false,
          coolDownEnd: 0,
          isCompetitive: false
        });
  // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    });
  });

router.post("/getRoom", (req, res) => {
  console.log('room check');
  const payload = {
    room: req.body.room
  };
// Sign token
  jwt.sign(
    payload,
    keys.secretOrKey,
    {
      expiresIn: 31556926 // 1 year in seconds
    },
    (err, token) => {
      res.json({
        success: true,
        token: "Bearer " + token
      });
    }
  );
});


  // @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
    // Form validation
    console.log(req.body);

  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
    if (!isValid) {
      console.log("invalid");
      return res.status(400).json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;
  // Find user by email
    User.findOne({ email }).then(user => {
      // Check if user exists
      if (!user) {
        console.log("email unfound");
        return res.status(404).json({ emailnotfound: "Email not found" });
      }
  // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name,
            rank: user.rank,
            isCoolDown: user.isCoolDown,
            coolDownEnd: user.coolDownEnd,
            isCompetitive: false
          };
  // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          console.log('password no good');
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      });
    });
  });

  router.post("/updateUserRank", (req, res) => {
    User.updateOne({ name: req.body.name }, { rank: (req.body.rank + req.body.eloUpdate)})
    .then(returnData => {
      User.findOne( { name: req.body.name }).then( user => {
        console.log('router post');
        const payload = {
          id: user.id,
          name: user.name,
          rank: user.rank,
          isCoolDown: user.isCoolDown,
          coolDownEnd: user.coolDownEnd,
          isCompetitive: user.isCompetitive
        };
        console.log('payload');
        console.log(payload);
        jwt.sign(
          payload, 
          keys.secretOrKey,
          {
            expiresIn: 31556926
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer" + token
            })
          }
        )
      })
    })
  })

  router.post("/setIsCompetitive", (req, res) => {
    User.updateOne({ name: req.body.name }, { isCompetitive: req.body.isCompetitive })
    .then(returnData => {
      User.findOne( { name: req.body.name }).then( user => {
        console.log('router post');
        const payload = {
          id: user.id,
          name: user.name,
          rank: user.rank,
          isCoolDown: user.isCoolDown,
          coolDownEnd: user.coolDownEnd,
          isCompetitive: user.isCompetitive
        };
        console.log('payload');
        console.log(payload);
        jwt.sign(
          payload, 
          keys.secretOrKey,
          {
            expiresIn: 31556926
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer" + token
            })
          }
        )
      })
    })
  })

  router.post("/coolDown", (req,res) => {
    console.log(req.body.time)
    User.updateOne({ name: req.body.name }, { isCoolDown: true, coolDownEnd: req.body.time})
    .then(returnData => {
      User.findOne( { name: req.body.name }).then( user => {
        console.log('router post');
        const payload = {
          id: user.id,
          name: user.name,
          rank: user.rank,
          isCoolDown: user.isCoolDown,
          coolDownEnd: user.coolDownEnd,
          isCompetitive: user.isCompetitive
        };
        console.log('payload');
        console.log(payload);
        jwt.sign(
          payload, 
          keys.secretOrKey,
          {
            expiresIn: 31556926
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer" + token
            })
          }
        )
      })
    })
  })

  router.post("/endCoolDown", (req,res) => {
    User.updateOne({ name: req.body.name }, { coolDown: false, coolDownEnd: 0})
    .then(returnData => {
      User.findOne( { name: req.body.name }).then( user => {
        console.log('router post');
        const payload = {
          id: user.id,
          name: user.name,
          rank: user.rank,
          coolDown: user.coolDown,
          coolDownEnd: 0,
          isCompetitive: user.isCompetitive
        };
        console.log('payload');
        console.log(payload);
        jwt.sign(
          payload, 
          keys.secretOrKey,
          {
            expiresIn: 31556926
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer" + token
            })
          }
        )
      })
    })
  })

  router.post("/getChallenge", (req, res) => {

    var i = req.body.ID;
    console.log(i);
    if(typeof i === 'string'){
      i = parseInt(i, 10);
    }
    console.log(typeof i);

    Challenge.findOne({ i }).then(challenge => {
      // Check if chnallenge exists
      if (!challenge) {
        return res.status(404).json({ challengenotfound: "Challenge not found" });
      }
      else{

        const payload = {
          challenge: challenge
        };

        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      }


    });
  });


router.post("/addChallenge", (req, res) => {

    const newChallenge = new Challenge({
      i: req.body.i,
      name: req.body.name,
      description: req.body.description,
      inputTypes: req.body.inputTypes,
      inputVarNames: req.body.inputVarNames,
      outputType: req.body.outputType,
      inputs: req.body.inputs,
      outputs: req.body.outputs,
      methodName: req.body.methodName,
      dataStructure: req.body.dataStructure,
      imports: req.body.imports
      
    });
    newChallenge.save().then(challenge => res.json(challenge));

});

router.post("/getChallengeByID", (req, res)=> {
  const i = req.body.ID;
  Challenge.findOne({ i }).then(challenge => {
    // Check if challenge exists
    if (!challenge) {
      return res.status(404).json({ challengenotfound: "Challenge not found" });
    }
    else{

      const payload = {
        challenge: challenge
      };

      jwt.sign(
        payload,
        keys.secretOrKey,
        {
          expiresIn: 31556926 // 1 year in seconds
        },
        (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        }
      );
    }


  });
});


module.exports = router;