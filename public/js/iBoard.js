"use strict";

    ////////////////////////////////// COMMENT /////////////////////////////
    /////////////////////////////////////////////////////////////////////

Vue.component('comment', {
    template: '#comment-temp',
    props: ['imgidgrnadchild', 'comment'],
    data: function() {
        return {}
    }
})

    ////////////////////////////////// MODAL /////////////////////////////
    /////////////////////////////////////////////////////////////////////

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
                console.log('return length', resp.data.length);
                if (resp.data.length < 1) {
                    this.escapeModal();
                    return
                }
                console.log('got back', resp.data[0]);
                this.image = resp.data[0]
            }.bind(this));

        this.getCommentsById(this.imgidchild);

        window.addEventListener('keydown', this.escapeListen.bind(this))
    },
    destroyed: function() {
        console.log('destroyed');
        location.hash = '#';
        ////
        // WARNING:   does not remove listener ???
        ////
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
    /////////////////////////////////////////////////////////////////////
new Vue({
    el: '#main',
    data: {
        describer: 'latest images',
        images: [],
        imgId: '',
        upForm: {
            iTitle: '',
            iUser: '',
            iDescr: '',
            iFiles: []
        },
        notFirst: false,
        notLast: true
    },
    mounted: function() {
        axios.get('/getRecent')
            .then(function(resp) {
                this.images = resp.data;
            }.bind(this))

        this.checkHash();
        window.addEventListener('hashchange', function() {
            this.checkHash()
        }.bind(this))
    },
    watch: {
        imgId: function(id) {
            this.selectImg(id)
        }
    },
    methods: {
        checkHash: function(currHash) {
            var currHash = location.hash.slice(1);
            console.log('curr hash..', currHash);
            this.imgId = '';

            ////////
            // WARNING: does not reload because it does not destroy the component..

            if (typeof +currHash === 'number' && !isNaN(+currHash)) {
                console.log('dvabcnads', this.imgId, currHash);
                this.imgId = currHash
            } else {
                location.hash = '#'
            }
        },
        loadNext: function() {
            axios.get('/getNext/' + this.images[this.images.length - 1].id)
                .then(function(resp) {
                    console.log('new page next..', resp.data);
                    this.images = resp.data;
                    console.log(resp.data[0].lowest_id === resp.data[resp.data.length -1].id, resp.data[0].lowest_id, resp.data[resp.data.length -1].id);
                    resp.data[0].highest_id === resp.data[0].id ? this.notFirst = false : this.notFirst = true;
                    resp.data[0].lowest_id === resp.data[resp.data.length -1].id ? this.notLast = false : this.notLast = true;
                    console.log('not last', this.notLast);
                }.bind(this))
        },
        loadPrev: function() {
            console.log('ajsaksxkas', this.images[0].id);
            axios.get('/getPrev/' + this.images[this.images.length - 1].id)
                .then(function(resp) {
                    console.log('new page prev..', resp.data);
                    this.images = resp.data;
                    console.log(resp.data[0].highest_id === resp.data[0].id, resp.data[0].highest_id, resp.data[0].id);
                    resp.data[0].highest_id === resp.data[0].id ? this.notFirst = false : this.notFirst = true;
                    resp.data[0].lowest_id === resp.data[resp.data.length -1].id ? this.notLast = false : this.notLast = true;
                    console.log('not first', this.notFirst);
                }.bind(this))
        },
        closeModal: function() {
            this.imgId = ''
        },
        selectImg: function(id) {
            this.imgId = id
            console.log('show modal..', this.imgId);
        },
        ////
        //      WARNING: this is DEPRICATED... sorting in the db.query now
        ////
        sortImg: function(a, b) {
            return new Date(b.created_at) - new Date(a.created_at)
        }
        ////
        //      WARNING: this is DEPRICATED... sorting in the db.query now
        ////


        ,
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
