const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Using mongoose instead of arrays
// const items = ["Eat", "Study", "Sleep"];
// const workItems = [];

main().catch(err => console.log(err));

async function main(){
  await mongoose.connect('mongodb://127.0.0.1/todolistDB');
  console.log("Connected to database");

  const itemsSchema = new mongoose.Schema({
    name: String
  });

  const Item = mongoose.model("Item", itemsSchema);

  //initial items in list
  const item1 = new Item({
    name: "Welcome to your todolist!"
  });

  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });

  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });

  const defaultItems= [item1, item2, item3];

  // const foundItems = await Item.find({});

  const listSchema = {
    name: String,
    items: [itemsSchema]
  }

  const List = mongoose.model("List", listSchema);

  app.get("/", function(req, res) {

    fItems().catch(err => console.log(err));

    async function fItems(){
      const foundItems = await Item.find({});

      if(foundItems.length===0){
        Item.insertMany(defaultItems);
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    }

  });

  app.get("/:customListName", function(req, res){

    const customListName = _.capitalize(req.params.customListName);

    findOne().catch(err => console.log(err));

    async function findOne(){
      const foundList = await List.findOne({name: customListName});

      if(!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" +customListName);
      } else{
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }

  });

  // app.post("/", function(req, res){
  //
  //   const itemName= req.body.newItem;
  //
  //   const listName= req.body.list;
  //
  //
  //
  //    const item = new Item({
  //      name: itemName
  //    });
  //
  //    if (listName==="Today"){
  //      //in the default list
  //      item.save();
  //      res.redirect("/");
  //    } else{
  //      //in custom list
  //      findCustomList().catch(err => console.log(err));
  //
  //      async function findCustomList(){
  //        const foundList = await List.findOne({name: listName});
  //
  //        foundList.items.push(item);
  //        foundList.save();
  //        res.redirect("/" + listName);
  //      }
  //
  //  }
  //
  // });


  app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  if (!itemName.trim()) {
    // If the itemName is an empty string or contains only whitespace characters
    res.send("Enter a valid item."); // Display an error message
  } else {
    const item = new Item({
      name: itemName
    });

    if (listName === "Today") {
      // In the default list
      item.save();
      res.redirect("/");
    } else {
      // In custom list
      findCustomList().catch(err => console.log(err));

      async function findCustomList() {
        const foundList = await List.findOne({ name: listName });

        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    }
  }
});


  app.post("/delete", function(req, res){
    const checkedListName = req.body.listName;
    const checkedItemId = req.body.checkbox;

    if(checkedListName==="Today"){
      //In the default list
      del().catch(err => console.log(err));

      async function del(){
        await Item.deleteOne({_id: checkedItemId});
        res.redirect("/");
      }
    } else{
      //In the custom list

      update().catch(err => console.log(err));

      async function update(){
        await List.findOneAndUpdate({name: checkedListName}, {$pull: {items: {_id: checkedItemId}}});
        res.redirect("/" + checkedListName);
      }
    }

  });


  app.get("/about", function(req, res){
    res.render("about");
  });

  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });



}
