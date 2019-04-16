

new Vue({
    el: '#main',
    data: {
        images: [],
        describer: 'latest images'
    },
    mounted: function() {
        axios.get('/getRecent').then(function(resp) {
            this.images = resp.data;
        }.bind(this))
    },
    methods: {
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
