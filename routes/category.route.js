const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const Categories = require("../models/categories");
const auth = require('../middleware/auth');

router.post(
    "/createCategory",
    [
        //validation
        check("name", "Category name is required").exists(),
    ],
    async (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({
                error: error.array(),
            });
        }
        const { name, children, parent } = req.body;
        const newCategory = {
            _id: JSON.stringify(Date.now()),
            name: name,
            children: [],
        };
        //    console.log(req.body);

        // return res.status(200).json(req.body)
        const category = new Categories({ name: name, children: children });
        // console.log(category);
        // try {
        //     category.save(async (err, category) => {
        //         if (err) return res.status(400).json("unable to create category");
        //         console.log(category);
        //         return res.json("category is created successfully");
        //     });

        // } catch (e) {
        //     console.log(e);
        //     return res.json("error");
        // }
        // return 0;
        try {
            if (parent.length > 0) {
                Categories.find({ _id: parent[0] }, (err, category1) => {
                    if (err) return res.status(400).json(err);

                    console.log(JSON.stringify(category1[0]));
                    if (category1[0]._id == parent[parent.length - 1]) {
                        category1[0].children.push(newCategory);
                        console.log(JSON.stringify(category1[0]));
                    } else {
                        var parentKey = 1;
                        for (let i = 0; i < category1[0].children.length; i++) {
                            console.log(category1[0].children[i]);
                            console.log(i);
                            if (category1[0].children[i]._id == parent[parentKey]) {
                                console.log("yess!! category1[0].children[i]._id == parent[i]");

                                if (parentKey == parent.length - 1) {
                                    category1[0].children[i].children.push(newCategory);
                                    console.log(JSON.stringify(category1));
                                } else {
                                    parentKey++;
                                    for (
                                        let j = 0;
                                        j < category1[0].children[i].children.length;
                                        j++
                                    ) {
                                        console.log(category1[0].children[i].children[j]);
                                        if (parentKey == parent.length - 1) {
                                            category1[0].children[i].children[j].children.push(
                                                newCategory
                                            );
                                            console.log(JSON.stringify(category1));
                                        }
                                    }
                                }
                            } else {
                                console.log("not category1[0].children[i]._id == parent[i]");
                            }
                        }
                    }
                    console.log(JSON.stringify(category1[0]));

                    Categories.findByIdAndUpdate(
                        { _id: parent[0] },
                        category1[0],
                        (err, category1) => {
                            if (err) return res.status(400).json(err);
                            console.log(category1);
                            return res.json("category is created successfully");
                        }
                    );
                });
            } else {
                category.save(async (err, category) => {
                    if (err) return res.status(400).json("unable to create category");
                    console.log(category);
                    res.json("category is created successfully");
                });
            }
        } catch (error) {
            return res.json("error creating category    " + error);
        }
    }
);

router.post(
    "/deleteCategory",
    [
        //validation
        check("_id", "_id is required").exists(),
    ],
    async (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({
                error: error.array(),
            });
        }
        let isMatched = false;
        const { _id } = req.body;
        const allCategories = await Categories.find({});
        console.log(allCategories);
        allCategories.map(category1 =>{
            if(category1._id == _id){
                isMatched = true;
            }else if (category1.children.length > 0){
                category1.children.map((child1,index1) => {
                    if(child1._id == _id){
                        isMatched = true;
                    }else if (child1.children.length > 0){
                        child1.children.map((child2,index2) =>{
                            if(child2._id == _id){
                                isMatched = true;
                            }
                        })
                    }

                })
            }
        });

        if(isMatched){
            try {
                Categories.find({}, (err, categories) => {
                    let isMatched = false;
                    if (err) return res.status(400).json("unable to delete category");
                     categories.map((category1,index) => {
                        console.log(category1._id);
                        console.log(_id);
                        if (category1._id == _id) {
                            console.log('inside the if!');
                            Categories.deleteOne({ _id: _id }, async (result => {
                                console.log(result);
                                isMatched=true;
                                return res.json({ msg: "Deleted" })
                            }))
                        } else if (category1.children.length > 0) {
                            category1.children.map((child1,index1) => {
                                if (child1._id == _id) {
                                    Categories.findByIdAndUpdate(
                                        { _id: category1._id },
                                        { $pull: { children: { _id: child1._id } } },
                                        async (err, result) => {
    
                                            if (err) return res.status(400).json({ msg: "Unable to delete category" })
    
                                            console.log(result);
                                            console.log(err);
                                            isMatched=true;
                                            return res.json({ msg: "Deleted" });
                                        }
                                    )
                                } else if (child1.children.length > 0) {
                                    child1.children.map((child2,index2) => {
                                        if (child2._id == _id) {
                                            Categories.findByIdAndUpdate(
                                                { _id: category1._id },
                                                { $pull: { "children.$[].children": { _id: child2._id } } },
                                                async (err, result) => {
                                                    console.log(err);
                                                    if (err) return res.status(400).json({ msg: "Unable to delete category" })
                                                    console.log(result);
                                                    isMatched=true;
                                                    return res.json({ msg: "Deleted" })
                                                }
                                            )
                                        }
                                        
                                    })
                                }
                                else if((index == categories.length-1) && (index1==category1.children.length-1)){
                                    console.log("sdfsdfasd");
                                    return res.status(400).json({ msg: "Not Found"})
                                }
                            })
                        }
                    });
                   
    
    
                });
    
    
    
            } catch (error) {
                return res.json("error creating category    " + error);
            }
        }else{
            return res.status(400).json({msg:"Category not found"})
        }
        
    }
);

router.get(
    "/getAllCategories",
    async (req, res) => {
        const categories = await Categories.find({});
        // console.log(categories);
        res.status(200).json(categories);
    }
);


module.exports = router;