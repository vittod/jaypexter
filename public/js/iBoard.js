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

    ////////////////////////////////// MODAL IMG /////////////////////////
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
        this.loadModalData()
    },
    watch: {
        imgidchild: function() {
            this.loadModalData()
        }
    },
    destroyed: function() {
        console.log('destroyed');
        location.hash = '#';
    
        window.removeEventListener('keydown', this.escapeListen)
    },
    methods: {
        loadModalData: function() {
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

            this.escapeListen = this.escapeListen.bind(this);
            window.addEventListener('keydown', this.escapeListen)
        },
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
            this.$emit('escape', '')
        },
        escapeListen: function(e) {
            console.log(e.key);
            if (e.key === 'Escape') {
                this.escapeModal()
            }
        },
        deleteImg: function(id) {

            axios.post('/deleteImg', { delId: id, delUrl: this.image.url })
            .then(function(resp) {
                console.log('deleted..', resp);
                this.$emit('refresh')
                this.escapeModal();
            }.bind(this))
            .catch(function(err) {
                console.log('prob deleting..', err);
            })

        }
    }
})

    ////////////////////////////////// UPLOAD META FORM /////////////////
    /////////////////////////////////////////////////////////////////////

Vue.component('upload-form', {
    template: '#upform-temp',
    props: ['idx'],
    data: function() {
        return {
            iTitle: '',
            iDescr: '',
            iUser: ''
        }
    },
    watch: {
        iTitle: function() {
            this.updateData()
        },
        iDescr: function() {
            this.updateData()
        },
        iUser: function() {
            this.updateData()
        }
    },
    methods: {
        updateData: function() {
            this.$emit('updatemeta', {
                iTitle: this.iTitle,
                iDescr: this.iDescr,
                iUser: this.iUser,
                idx: this.idx
            })
        }
    }

})

    ////////////////////////////////// FILTER //////////////////////////
    /////////////////////////////////////////////////////////////////////

Vue.filter('filterDate', function(dateString) {
    var dateObj = new Date(dateString)
    return `${dateObj.getHours()}:${dateObj.getMinutes()} ${dateObj.getMonth()}/${dateObj.getDay()}/${dateObj.getFullYear()}`
})

    ////////////////////////////////// MAIN /////////////////////////////
    /////////////////////////////////////////////////////////////////////

new Vue({
    el: '#main',
    data: {
        describer: 'latest images',
        images: [],
        imgId: '',
        metaDataCollection: {},
        upForm: {
            iTitle: '',
            iUser: '',
            iDescr: '',
            iFiles: []
        },
        dropzone: {},
        notFirst: false,
        notLast: true,
        siteLimit: 8,
        showLoader: false
    },
    mounted: function() {
                                        ////////////////////////////////////////initialize
        this.getRecent();
        this.checkHash();
        window.addEventListener('hashchange', function() {
            this.checkHash()
        }.bind(this))
                                        ////////////////////////////////////////dragstuff
        this.dropzone = document.getElementById('box-upload');
        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop']
            .forEach(function(el) {
                this.dropzone.addEventListener(el, function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                })
            }.bind(this))
        console.log(this.dropzone);
        this.dropzone.addEventListener('drop', function(e) {
            this.upForm.iFiles = Array.prototype.slice.call(e.dataTransfer.files)
            this.dropzone.classList.remove('box-upload-drag')
            console.log(this.upForm.iFiles);
        }.bind(this))
        this.dropzone.addEventListener('dragenter', function() {
            this.dropzone.classList.add('box-upload-drag')
        }.bind(this))
        this.dropzone.addEventListener('dragleave', function() {
            this.dropzone.classList.remove('box-upload-drag')
        }.bind(this))
    },
    watch: {
        imgId: function(id) {
            this.selectImg(id)
        }
    },
    methods: {
        updateMeta: function(evt) {
            //console.log(evt);
            this.metaDataCollection[evt.idx] = evt
        },
        checkHash: function(currHash) {
            //this.closeModal();
            var currHash = location.hash.slice(1);
            console.log('curr hash..', currHash);

            if (typeof +currHash === 'number' && !isNaN(+currHash)) {
                this.imgId = currHash
                console.log('set curr hash', this.imgId, currHash);
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

            // WARNING:         jumst to the fist not prev age..
            //

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
            console.log('should destroy modal by setting imgId to ""..', this.imgId);
        },
        selectImg: function(id) {
            this.imgId = id
            console.log('show modal..', this.imgId);
        },
        setFiles: function(e) {
            this.upForm.iFiles = Array.prototype.slice.call(e.target.files);
            console.log(this.upForm.iFiles);
        },
        uploadFile: function() {
            Promise.all(this.upForm.iFiles.map(function(el, i) {
                var upData = new FormData();
                upData.append('iTitle', this.metaDataCollection[i] ? this.metaDataCollection[i].iTitle : '');
                upData.append('iUser', this.metaDataCollection[i] ? this.metaDataCollection[i].iUser : '');
                upData.append('iDescr', this.metaDataCollection[i] ? this.metaDataCollection[i].iDescr : '');
                upData.append('iFile', el);
                var tmpTitle = this.upForm.iTitle;
                this.showLoader = true;
                return axios.post('/postImg', upData)
            }.bind(this)))
                .then(function(resp) {
                    this.getRecent();
                    this.showLoader = false
                }.bind(this))
                .catch(err => console.log('err post img..', err))
            this.upForm = {iFiles: []};
            this.metaDataCollection = {}
        },
        getRecent: function() {
            axios.get('/getRecent')
                .then(function({data}) {
                    console.log(data);
                    if (data[data.length -1].lowest_id === data[data.length -1].id) {
                        this.notLast = false
                    }
                    this.images = data;
                }.bind(this))
                .catch(function(err) {
                    console.log('cant get first page..', err);
                })
        },

        // WARNING:  artefact.. delete or change
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
