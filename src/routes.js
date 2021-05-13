"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const FavoriteDoctor = require("./schema/FavoriteDoctor");
const FavoriteCompanion = require("./schema/FavoriteCompanion");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
        .sort('ordering')
            .then(data => {
                res.status(200).send(data);
                return
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        console.log(req.body)
        if (req.body.seasons !== undefined && req.body.name){
            Doctor.create(req.body).save()
            .then(doc => {
                res.status(201).send(doc)
                return
            })
            .catch(err =>
                {
                    res.status(404).send(err)
                })
        }
        else{
            res.status(500).send("not enough info to build a doctor!")
        }
        
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        FavoriteDoctor.find({})
            .sort('ordering')
            .then(data => {
                let lstOfDoc = []
                data.forEach(doctor => {
                    lstOfDoc.push(doctor.doctor)
                })
                Doctor.find({_id: {$in: lstOfDoc}})
                .then(docs => {
                    res.status(200).send(docs);
                    return
                })
                .catch(err => {
                    res.status(500).send(err);
                })
                
            })
            .catch(err => {
                res.status(500).send(err);
            })
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        FavoriteDoctor.find({doctor : req.body.doctor_id})
        
        .then(docExist =>
            {
                if (docExist.length != 0){
                    
                    res.status(500).send("doc already exists")
                }
                else{
                    FavoriteDoctor.create(req.body.doctor_id).save()
                    .then(doc => {
                      
                        Doctor.findById(doc.doctor)
                        .then(fullDoc => {
                            if (fullDoc)    { 
                            res.status(201).send(fullDoc)
                            }
                            else {
                                res.status(500).send("missing doc!")
                            }
                        })
                        .catch(err => {
                            res.status(500).send(err)
                        });
                    })
                    .catch(err => {
                        res.status(500).send(err)
                    });
                }
            })
        .catch(err => res.status(500).send(err))
        
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.find({_id: req.params.id})
        .then(doc => {
            console.log(doc[0].name)
            if (doc.length != 0){
                console.log(doc[0])
                res.status(200).send(doc[0]);
                return
            }
        })
        .catch(err => {
            res.status(404).send("Doctor not found");
                return
        })
                
            
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        console.log('doing patch with', req.params.id)
        // console.log('rqe.body', req)
        // Doctor.find({_id: req.params.id})
        // .then((doc) => console.log(doc))
        Doctor.findOneAndUpdate(
            {_id: req.params.id},
            req.body,
            {new: true})
        .then(doc => {
            console.log("doc found and updated", doc)
            res.status(200).send(doc);
        })
        .catch(err => {
            console.log("doc not found", err)
            res.status(404).send(err);
        })
        
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        Doctor.findOneAndDelete({_id: req.params.id})
        .then(doc =>{
            if (doc){
                res.status(200).send()
            }
            else {
                res.status(404).send("doctor not found!")
            }
        })
        .catch(err => res.status(500).send(err))
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        Companion.find({doctors: req.params.id})
        .sort('ordering')
        .then(comp => {
            if (comp.length != 0){
                res.status(200).send(comp);
                return
            }
        })
        .catch(err => {
            res.status(404).send("doctor not found");
                return
        })
    });
    

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        Companion.find({doctors: req.params.id})
        .then(comp => {
            if (comp.length != 0){
                let i;
                for (i = 0; i < comp.length; i++){
                        if (!comp[i].alive){
                            res.status(200).send(false);
                            return         
                        }
                    }
                    res.status(200).send(true);
                    return
            }
        })
        .catch(err => {
            res.status(404).send("doctor not found");
            return
        })
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        FavoriteDoctor.findOneAndDelete({doctor: req.params.doctor_id})
        .then(doc => {
            if (doc){
                res.status(200).send()
            }
            else{
                res.status(404).send("doctor not found!")
            }
        })
        .catch(err => res.status(500).send(err))
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        if (req.body.name && req.body.character && req.body.doctors !== undefined && req.body.seasons != undefined && req.body.alive != null){
            Companion.create(req.body).save()
            .then( doc => {
                res.status(201).send(doc)
                return
            })
            .catch(err =>
                {
                    res.status(404).send(err)
                })
        }
        else {
            res.status(500).send("not enough info to create a companion")
        }
        
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        Companion.find({'doctors.1': {$exists: true}})
        .then(comps =>
            {
                res.status(200).send(comps)
            })
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        FavoriteCompanion.find({})
            .then(data => {
                let lstOfComp = []
                data.forEach(comp => {
                    lstOfComp.push(comp.companion)
                })
                console.log(lstOfComp);
                Companion.find({_id: {$in: lstOfComp}})
                .then(comps => {
                    res.status(200).send(comps);
                    return
                })
                .catch(err => {
                    res.status(500).send(err);
                })
                
            })
            .catch(err => {
                res.status(500).send(err);
            })
        
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        FavoriteCompanion.find({companion : req.body.companion_id})
        .then(compExist =>
            {
                if (compExist.length != 0){
                    
                    res.status(500).send("companion already favorited")
                }
                else{
                    FavoriteCompanion.create(req.body.companion_id).save()
                    .then(comp => {
                      
                        Companion.findById(comp.companion)
                        .then(fullComp => {
                           
                            if (fullComp)    { 
                            res.status(201).send(fullComp)
                            }
                            else {
                                res.status(500).send("missing doc!")
                            }
                        })
                        .catch(err => {
                            res.status(500).send(err)
                        });
                    })
                    .catch(err => {
                        res.status(500).send(err)
                    });
                }
            })
        .catch(err => res.status(500).send(err))
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
        .then(comp => {
            res.status(200).send(comp)
            return
        })
        .catch(err => {
            res.status(404).send("companion doesn't exist! \n" + err)
            return
        })
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        Companion.findOneAndUpdate(
            {_id: req.params.id},
            req.body,
            {new: true})
        .then(comp => {
            res.status(200).send(comp);
        })
        .catch(err => {
            res.status(404).send(err);
        })
        
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        Companion.findOneAndDelete({_id: req.params.id})
        .then(comp =>{
            if (comp){
                res.status(200).send()
            }
            else {
                res.status(404).send("companion not found!")
            }
        })
        .catch(err => res.status(500).send(err))
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        
        Companion.findById(req.params.id)
        .then(comp => {
            Doctor.find({_id: {$in: comp.doctors}})
            .then(
                docs => {
                    if (docs){
                        res.status(200).send(docs)
                    }
                    else{
                        res.status(404).send("no docs exist!");
                    }
                }
            )
            .catch(err =>
                {
                    res.status(404).send("companion doesn't exist!");
                    return
                }
            )
            })
        .catch(err =>
            {
                res.status(404).send("companion doesn't exist!");
                return
            }
        )
        });
       

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        Companion.findById(req.params.id)
        .then(comp => {
            Companion.find({seasons: {$in: comp.seasons}})
            .then(lstOfComps =>
                {
                    const finalListOfComps = lstOfComps.filter(companion => companion.name !== comp.name)
                    if (lstOfComps){
                        res.status(200).send(finalListOfComps)
                    }
                    else{
                        res.status(404).send("no companion friends!")
                    }
                }
            )
        })
        .catch(err =>
            {
                res.status(404).send(err);
            })
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        FavoriteCompanion.findOneAndDelete({companion: req.params.companion_id})
        .then(comp => {
            if (comp){
                res.status(200).send()
            }
            else{
                res.status(404).send("companion not found!")
            }
        })
        .catch(err => res.status(500).send(err))
    });

module.exports = router;