(function() {
    Vue.component("image-modal", {
        // data, methods, mounted
        template: "#image-modal-template",
        props: ["id"],
        // props: ["planetModal"],
        data: function() {
            return {
                image: {},
                comments: [],
                username: "",
                comment: ""
            };
        },
        mounted: function() {
            console.log("this in component:", this);
            var me = this;
            axios
                .get("/image-overlay/" + me.id)
                .then(function(response) {
                    // console.log("me.images in then", me.images);
                    console.log(
                        "Response axios /image-overlay: ",
                        response.data
                    );
                    me.image = response.data.rows[0];
                })
                .catch(function(error) {
                    console.log("error in get /images: ", error);
                });
            axios
                .get("/comments/" + me.id)
                .then(function(response) {
                    // console.log("me.images in then", me.images);
                    console.log("Response axios /comments: ", response.data);
                    me.comments = response.data;
                })
                .catch(function(error) {
                    console.log("error in get /comments: ", error);
                    if (error) {
                        this.showModal = false;
                    }
                });
        },
        watch: {
            id: function() {
                var me = this;
                axios
                    .get("/image-overlay/" + me.id)
                    .then(function(response) {
                        console.log(
                            "Response axios /image-overlay: ",
                            response.data
                        );
                        me.image = response.data.rows[0];
                    })
                    .catch(function(error) {
                        console.log("error in get /images: ", error);
                    });
            },
            comment: function() {
                var me = this;
                axios
                    .get("/comments/" + me.id)
                    .then(function(response) {
                        console.log(
                            "Response axios /comments: ",
                            response.data
                        );
                        me.comments = response.data;
                    })
                    .catch(function(error) {
                        console.log("error in get /comments: ", error);
                    });
            }
        },
        //methods only run when a user does something
        methods: {
            closeModal: function() {
                this.$emit("close");
                // console.log("closeModal works!");
            },
            myClick: function() {
                // console.log("myClick worked!");
            },
            submitComment: function(e) {
                e.preventDefault();
                console.log("submitComment this: ", this);
                var me = this;
                var commentsObj = {};
                commentsObj.username = this.username;
                commentsObj.comment = this.comment;
                axios
                    .post("/comments/" + me.id, commentsObj)
                    .then(function(response) {
                        me.comments.unshift(response.data.rows[0]);
                        me.username = "";
                        me.comment = "";
                        // console.log(
                        //     "resp from axios.post /comments",
                        //     response.data
                        // );
                    })
                    .catch(function(error) {
                        console.log("error in axios.post /comments: ", error);
                    });
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            url: "",
            id: location.hash.slice(1),

            showModal: false,
            showMoreButton: true
        },

        mounted: function() {
            console.log("Vue has mounted!");
            // console.log("Images is:", this.images);
            // console.log(me.images);
            var me = this;
            addEventListener("hashchange", function() {
                me.id = location.hash.slice(1);
                me.showModal = me.id;
            });
            axios
                .get("/images")
                .then(function(response) {
                    // console.log("me.images in then", me.images);
                    // console.log("axios.geet /images response: ", response.data);
                    me.images = response.data.rows;
                })
                .catch(function(error) {
                    console.log("error in get /images: ", error);
                });
        },
        methods: {
            closeModalOnParent: function() {
                // console.log("closeModalOnParent running");
                this.showModal = false;
                location.hash = "";
            },

            showModalMethod: function(id) {
                //vue instance
                // console.log("showModalMethod running!");
                this.showModal = true;
                console.log("id:", id);
                console.log("this", this);
                this.id = id;
            },

            handleClick: function(e) {
                e.preventDefault();
                console.log("this: ", this);

                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                var me = this;
                axios
                    .post("/upload", formData)
                    .then(function(response) {
                        me.images.unshift(response.data.rows[0]);
                        me.title = "";
                        me.description = "";
                        me.username = "";
                        document.getElementById("img-upload").value = "";
                        console.log("resp from axios.post /upload", response);
                    })
                    .catch(function(error) {
                        console.log("error in axios.post /upload: ", error);
                    });
            },

            handleChange: function(e) {
                console.log("handleChange is running");
                console.log("file: ", e.target.files[0]);
                console.log("e.target", e.target.files);
                this.file = e.target.files[0];
            },

            getMoreImages: function(e) {
                console.log("this", this.id);
                e.preventDefault();
                var me = this;
                var lastId = me.images[me.images.length - 1].id;
                axios
                    .get("/more-images/" + lastId)
                    .then(function(response) {
                        console.log(
                            "axios.get /more-images response: ",
                            response.data
                        );
                        // console.log(me.images.length - 1);
                        // console.log(me.images[me.images.length - 1].id);
                        // console.log(me.images);
                        me.images.push(...response.data);

                        if (me.images.length % 10 != 0) {
                            me.showMoreButton = false;
                        } else if (me.images.length < 10 != 0) {
                            me.showMoreButton = false;
                        }
                    })
                    .catch(function(error) {
                        console.log("error in axios.get /more-images: ", error);
                    });
            }
        }
    });
    (function(document, window, index) {
        var inputs = document.querySelectorAll(".inputfile");
        Array.prototype.forEach.call(inputs, function(input) {
            var label = input.nextElementSibling,
                labelVal = label.innerHTML;

            input.addEventListener("change", function(e) {
                var fileName = "";
                if (this.files && this.files.length > 1)
                    fileName = (
                        this.getAttribute("data-multiple-caption") || ""
                    ).replace("{count}", this.files.length);
                else fileName = e.target.value.split("\\").pop();

                if (fileName) label.querySelector("span").innerHTML = fileName;
                else label.innerHTML = labelVal;
            });

            // Firefox bug fix
            input.addEventListener("focus", function() {
                input.classList.add("has-focus");
            });
            input.addEventListener("blur", function() {
                input.classList.remove("has-focus");
            });
        });
    })(document, window, 0);
})();
