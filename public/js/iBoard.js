"use strict";

Vue.component('comment', {
    props: ['imgidgrnadchild'],
    template: '#comment-temp',
    data: function() {
        return {}
    }
})

Vue.component('img-modal', {
    props: ['imgidchild'],
    template: '#modal-temp',
    data: function() {
        return {
            image: '',
            commentTxt: '',
            username: ''
        }
    },
    mounted: function() {
        console.log('hello got here', this.imgidchild);
        axios.get('/getById/' + this.imgidchild)
            .then(function(resp) {
                console.log('got back', resp.data[0]);
                this.image = resp.data[0]
            }.bind(this));
        window.addEventListener('keydown', this.escapeListen.bind(this))
    },
    destroyed: function() {
        console.log('destroyed');
        window.removeEventListener('keydown', this.escapeListen)
    },
    methods:{
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
    },
})

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
