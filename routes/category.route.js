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
        const { _id } = req.body;
            

        // return 1;

        // res.json(categories);
        try {
            Categories.find({}, (err, categories) => {

                if (err) return res.status(400).json("unable to delete category");

                //  console.log(category1[0]._id);
                //  console.log(_id);
                 categories.map(category1=>{
                    console.log(category1._id);
                    console.log(_id);
                    if (category1._id == _id) {       
                        console.log('inside the if!');             
                        Categories.deleteOne({_id: _id },(result => {
                            console.log(result);
                            return res.json({ msg: "Deleted" })
                        }))
                    }else{
                        console.log('inside the else!');
                    }
                 })
                

            });



        } catch (error) {
            return res.json("error creating category    " + error);
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