var firebaseConfig = {
  apiKey: "AIzaSyDIGcg044Wds3rEgBT7SGOUT2-RPyln7Kg",
  authDomain: "fir-101-d61c8.firebaseapp.com",
  projectId: "fir-101-d61c8",
  storageBucket: "fir-101-d61c8.appspot.com",
  messagingSenderId: "658019807237",
  appId: "1:658019807237:web:bb0710817fe8328f816c6c",
  measurementId: "G-LSCPQFV19E"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var db = firebase.firestore();


$(document).ready(function ($) {

  //로그인 상태에 변동이 있을때 실행됨
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log(user);
      onLoadData();


      $("#profile").css("display", "block");
      $("#profile_img").attr("src", user.photoURL);
      $("#profile_info").css("display", "block");
      $("#profile_name").text(user.displayName);

      $("#login").css("display", "none");
      $("#logout").css("display", "block");


    } else {
      console.log('not login');
      $("#profile").css("display", "none");
      $("#profile_img").attr("src", "");
      $("#profile_info").css("display", "none");
      $("#profile_name").text("");

      $("#login").css("display", "block");
      $("#logout").css("display", "none");
    }
  });
});


function googlelogIn() {
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/plus.login");
  provider.setCustomParameters({
    prompt: "select_account"
  });
  //페이지 전환도 있음.

  firebase.auth().signInWithRedirect(provider).then(function (result) {
    firebase.auth()
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        // This gives you a Google Access Token. You can use it to access the Google API. var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
      })
      .catch(function (error) { // Handle Errors here.
        var errorCode = error.code;
        // The email of the user's account used.
        var email = error.email;
      });
  });
}

function logout() {
  firebase.auth().signOut().then(function () {}, function (error) {
    //DO
  });
}

var _allBbs = [];

function onLoadData() {
  $("#tblData").empty();
  db.collection("bbs")
    // .where("email", "==","aaa@222.com")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var _t = {
          id: doc.id,
          value: doc.data()
        }
        _allBbs.push(_t);

        //console.log(doc.id, " => ", doc.data());

        var _str = '<tr onclick=onSelectData(\'' + doc.id + '\')>';
        _str += "<td>" + doc.data().email + "</td>";
        _str += "<td>" + doc.data().name + "</td>";
        _str += "<td>" + getCurrentTime(new Date(doc.data().eventtime.seconds * 1000)) + "</td>";
        _str += "<td><img style='width:50px' src='" + doc.data().img + "'/></td></tr>";

        $("#tblData").append(_str);

      });

    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}

function onSelectData(id) {

  console.log(id);
  var _item = _allBbs.find(item => item.id == id);
  console.log(_item);

  if (_item) {
    $("#btnUpdate").attr("data-rec-id", id);
    $("#btnDelete").attr("data-rec-id", id);
    $("#exampleInputFile").attr("data-rec-id", id);
    $("#exampleInputEmail1").val(_item.value.email);
    $("#exampleInputName").val(_item.value.name);
  } else {
    $("#btnUpdate").attr("data-rec-id", '');
    $("#btnDelete").attr("data-rec-id", '');
    $("#exampleInputFile").attr("data-rec-id", '');
  }
}

function onAddRecord() {
  // alert('onAddRecord');
  // db.collection("bbs")
  // .add({
  //   name: "aaa", 
  //   email: "bbb", 
  //   eventtime: new Date()
  // })
  // .then((docRef) => {
  //   console.log("Document written with ID: ", docRef.id);
  // })
  // .catch((error) => {
  //   console.error("Error addming document: ", error);
  // });

  // <tr>
  //   <td>183</td>
  //   <td>John Doe</td>
  //   <td>11-7-2014</td>
  // </tr>

  var _email = $("#exampleInputEmail1").val();
  var _name = $("#exampleInputName").val();
  var _date = new Date();


  db.collection("bbs").add({
      name: _name,
      email: _email,
      eventtime: _date
    })
    .then((docRef) => {
      $("#exampleInputEmail1").val("");
      $("#exampleInputName").val("");

      var _str = "<tr>";
      _str += "<td>" + _email + "</td>";
      _str += "<td>" + _name + "</td>";
      _str += "<td>" + _date + "</td></tr>";

      $("#tblData").append(_str);

      console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });

}

function onUpdateRecord() {
  var _email = $("#exampleInputEmail1").val();
  var _name = $("#exampleInputName").val();
  var _date = new Date();
  var db = firebase.firestore();

  var _id = $("#btnUpdate").attr("data-rec-id");
  var _img = $("#loadedimg").attr("data-uploaded-url");
  var mRef = db.collection('bbs').doc(_id);
  // mRef
  //   .update({
  //     name: _name,
  //     email: _email,
  //     img: _img,
  //     eventtime: new Date(),
  //   })
  //   .then(function () {
  //     onLoadData();
  //   });


    mRef
    .set({
      name: _name,
      email: _email,
      img: _img,
      eventtime: new Date(),
    }, {merge: true})
    .then(function () {
      onLoadData();
    });

  // db
  //   .collection("bbs")
  //   .doc(id)
  //   .set({
  //     name: _name,
  //     email: _email,
  //     eventtime: _date
  //     //newcolumn: "T"
  //   }, {
  //     merge: true
  //   })
  //   .then(function(){});
}

function onDeleteRecord() {
  var user = firebase.auth().currentUser;

  if (user) {
    var _id = $("#btnDelete").attr("data-rec-id");
    db.collection("bbs").doc(_id).delete().then(
      () => {
        $("#exampleInputEmail1").val('');
        $("#exampleInputName").val('');
        console.log("Document successfully delete!");
        onLoadData();
      }).catch(
      (error) => {
        console.error("Error removing document: ", error);
      });
  }
}


function getCurrentTime(val) {
  var t = "";
  var t1 = new Date(val);
  var yyyy = t1.getFullYear().toString();
  var mm = (t1.getMonth() + 1).toString();
  var dd = t1.getDate().toString();
  var hh = t1.getHours() < 10 ? "0" + t1.getHours() : t1.getHours();
  var min = t1.getMinutes() < 10 ? "0" + t1.getMinutes() : t1.getMinutes();
  var ss = t1.getSeconds() < 10 ? "0" + t1.getSeconds() : t1.getSeconds();
  t =
    yyyy +
    "/" +
    (mm[1] ? mm : "0" + mm[0]) + "/" +
    (dd[1] ? dd : "0" + dd[0]) + " " +
    hh +
    ":" +
    min +
    ":" +
    ss;
  return t;
}

function createFile(file) {
  if (!file.type.match("image.*")) {
    alert("이미지 화일을 선택해주세요."); 
    return;
  } else {
    // var img = new Image();
    var reader = new FileReader();
    var vm = this;
    reader.onload = function (e) {
      // vm.image = e.target.result; 
      vm.saveToFirebaseStorage(e, file);
    };
    reader.readAsDataURL(file);
  }
}

function handleChange(event) {
  createFile(event.target.files[0]);
}

function saveToFirebaseStorage(evt, items) {
  var user = firebase.auth().currentUser;
  if (user) {
    var _key = new Date().getTime();
    var storageRef = firebase.storage().ref();
    var _name = items.name.replace(/[~`!#$%\^&*+=\-\[\]\\';,/{}()|\\":<>\?]/g, "");
    var uploadTask = storageRef
        .child("data/" + user.uid + "/" + _key + "/" + _name)
        .put(items); 
    
    uploadTask.on(
      "state_changed",
      function (snapshot) {
        var progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused' console.log("Upload is paused");
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running' console.log("Upload is running");
            break;
        }
      },
      function (error) {
        console.log(error);
      },
      function () {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          $("#loadedimg").attr('data-uploaded-url', downloadURL);
          $("#loadedimg").find('img').attr('src', downloadURL);
          $("#fileinput").css("display", 'none');
          $("#loadedimg").css('display', 'block');
        }).catch(
          (error) => {
            console.error("Error removing document: ", error);
          });
      }
    );
  }
}