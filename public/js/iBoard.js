"use strict";

    ////////////////////////////////// COMMENT /////////////////////////////

Vue.component('comment', {
    template: '#comment-temp',
    props: ['imgidgrnadchild', 'comment'],
    data: function() {
        return {}
    }
})

    ////////////////////////////////// MODAL /////////////////////////////

Vue.component('img-modal', {
    template: '#modal-temp',
    props: ['imgidchild'],
    data: function() {
        return {
            image: '',
            commentTxt: '',
            username: '',
            cmtRes: []
        }
    },
    mounted: function() {
        axios.get('/getById/' + this.imgidchild)
            .then(function(resp) {
                console.log('got back', resp.data[0]);
                this.image = resp.data[0]
            }.bind(this));

        this.getCommentsById(this.imgidchild);

        window.addEventListener('keydown', this.escapeListen.bind(this))
    },
    destroyed: function() {

        ////////////////
        ////////////////    does not remove listener ???
        ////////////////

        console.log('destroyed');
        window.removeEventListener('keydown', this.escapeListen)
    },
    methods:{
        getCommentsById: function(id) {
            axios.get('/getCommentsById/' + id)
                .then(function(resp) {
                    console.log('com res', resp.data);
                    this.cmtRes = resp.data
                }.bind(this))
        },
        postComment: function() {
            var tmpComment = {
                id: this.imgidchild,
                username: this.username,
                comment: this.commentTxt
            };
            this.commentTxt = '';
            this.username = '';
            console.log('post this shit', tmpComment);
            axios.post('/postComment', tmpComment)
                .then(function(resp) {
                    console.log('comm front res', resp);
                    tmpComment.created_at = Date.now();
                    this.cmtRes.unshift(tmpComment)
                }.bind(this))
                .catch(function(err) {
                    console.log('err post cmt', err)
                })
        },
        escapeModal: function(e) {
            console.log(e);
            this.$emit('escaped', '')
        },
        escapeListen: function(e) {
            console.log(e.key);
            if (e.key === 'Escape') {
                this.escapeModal()
            }
        }
    }
})

    ////////////////////////////////// MAIN /////////////////////////////

new Vue({
    el: '#main',
    data: {
        images: [],
        describer: 'latest images',
        upForm: {
            iTitle: '',
            iUser: '',
            iDescr: '',
            iFiles: []
        },
        imgId: ''
    },
    mounted: function() {
        axios.get('/getRecent').then(function(resp) {
            this.images = resp.data.sort(this.sortImg);
        }.bind(this))
    },
    methods: {
        closeModal: function() {
            this.imgId = ''
        },
        selectImg: function(id) {
            this.imgId = id
            console.log(this.imgId);
        },
        sortImg: function(a, b) {
            return new Date(b.created_at) - new Date(a.created_at)
        },
        setFiles: function(e) {
            this.upForm.iFiles = Array.prototype.slice.call(e.target.files);
            console.log(this.upForm.iFiles);
        },
        uploadFile: function(e) {
            this.upForm.iFiles.forEach(function(el) {
                var upData = new FormData();
                upData.append('iTitle', this.upForm.iTitle);
                upData.append('iUser', this.upForm.iUser);
                upData.append('iDescr', this.upForm.iDescr);
                upData.append('iFile', el);
                var tmpTitle = this.upForm.iTitle;
                this.upForm = {};
                axios.post('/postImg', upData)
                    .then(function(resp) {
                        this.images.unshift({
                            url: resp.data.url,
                            title: tmpTitle
                        })
                    }.bind(this))
                    .catch(err => console.log('err post img..', err))
            }.bind(this))
        },
        morph: function() {
            console.log(1);
            var res = this.describer;
            this.describer = this.describer.slice(1);
            setTimeout(function() {
                console.log(2);
                this.describer.length <= 0 ? this.describer = 'latest images' : this.morph();

            }.bind(this), 100)

        }
    }
})
