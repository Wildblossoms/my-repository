describe('Test', function() {

    var server = require('../env').server()
    before(function () {
        require('../login-as').admin(this)
    })

    it('should be created without questions, answers and taxonomies', function() {
        casper.then(function() {
            this.clickLabel('Add New', '*[@id="menu-posts-wpt_test"]/*//a')
        })

        casper.then(function() {
            'Fatal'.should.not.be.textInDOM
            'Add New Test'.should.be.inTitle

            this.evaluate(function() {
                jQuery('#edButtonHTML,#content-html').addClass('__text_tab_here')
            })
            this.click('.__text_tab_here')

            this.fill('form#post', {
                'post_title' : 'Are You Hot or Not?',
                'content'    : 'Allow others to rate the vacuum on the Earth',
                'wpt_test_page_submit_button_caption': 'Gimme Gimme'
            }, true)
        })

        casper.waitWhileSelector('form#post.wpt-ajax-save').waitForUrl(/message/, function() {
            'Fatal'.should.not.be.textInDOM
            '#message'.should.be.inDOM
            expect('post_title').to.have.fieldValue('Are You Hot or Not?')
            expect('content').to.have.fieldValue('Allow others to rate the vacuum on the Earth')
            expect('wpt_test_page_submit_button_caption').to.have.fieldValue('Gimme Gimme')
        })
    })

    it('should have page options just below "Publish" metabox', function() {
        casper.then(function() {
            var boxIds = this.evaluate(function() {
                return jQuery('#side-sortables .postbox')
                    .map(function() {
                        return this.id;
                    })
                    .get()
                    .join(',')
            })

            boxIds.should.match(/submitdiv,wpt_test_page_options,wpt_result_page_options/)
        })
    })

    it('should be updated', function() {
        casper.then(function() {
            this.evaluate(function() {
                jQuery('#edButtonHTML,#content-html').addClass('__text_tab_here')
            })
            this.click('.__text_tab_here')

            this.click('#wpt_question_add')
            this.fillSelectors('form#post', {
                '#title': 'Are You Hot or Not?!',
                '#content': 'Allow others to rate the vacuum on the Earth!',
                '#wpt_question_title_0': 'Are You Hot?',
            })
            this.click('.misc-pub-wpt-result-page-show-scales input[type=checkbox]') // not show scales later
            this.clickLabel(' Yes', 'label')
            this.clickLabel(' Lie', 'label')
            this.clickLabel(' Extraversion/Introversion', 'label')
            this.clickLabel(' Neuroticism/Stability', 'label')
            this.clickLabel(' Temperature', 'label')
            this.clickLabel(' ??????????????', 'label')
            this.click('#save-post')
        })

        casper.waitWhileSelector('form#post.wpt-ajax-save').waitForUrl(/message/, function() {
            'Fatal'.should.not.be.textInDOM
            '#message'.should.be.inDOM
            expect('post_title').to.have.fieldValue('Are You Hot or Not?!')
            expect('content').to.have.fieldValue('Allow others to rate the vacuum on the Earth!')
            this.fillSelectors('form#post', {
                '#wpt_score_value_0_0': '5',
                '#wpt_score_value_0_1': '25',
                '#wpt_score_value_0_2': '10'
            }, true)
        })
    })

    it('should be in [wptlist] shortcode after publish', function() {
        casper.thenOpen(server + '/?p=1', function() {
            '.wp-testing.shortcode.tests'.should.be.inDOM
            '.wp-testing.shortcode.tests li'.should.not.contain.text('Hot or Not?!')
        })

        casper.thenOpen(server + '/wp-admin/', function() {
            this.clickLabel('All Tests', '*[@id="menu-posts-wpt_test"]/*//a')
        })

        casper.then(function() {
            this.clickLabel('Are You Hot or Not?!', 'a')
        })

        casper.then(function() {
            'Edit Test'.should.be.inTitle
            this.click('#publish')
        })

        casper.waitWhileSelector('form#post.wpt-ajax-save').waitForUrl(/message/, function() {
            'Fatal'.should.not.be.textInDOM
            '#message'.should.be.inDOM
        })

        casper.thenOpen(server + '/?p=1', function() {
            '.wp-testing.shortcode.tests'.should.be.inDOM
            '.wp-testing.shortcode.tests li'.should.contain.text('Hot or Not?!')
        })
    })

    it('should be on home page after publish by default and not when hidden', function() {
        casper.thenOpen(server + '/wp-admin/', function() {
            this.clickLabel('Add New', '*[@id="menu-posts-wpt_test"]/*//a')
        })

        casper.then(function() {
            'Fatal'.should.not.be.textInDOM
            'Add New Test'.should.be.inTitle

            this.fill('form#post', {
                'post_title' : 'Test On Home By Default',
                'content'    : 'By default we are all on home'
            })
            this.click('#publish')
        })

        casper.waitWhileSelector('form#post.wpt-ajax-save').waitForUrl(/message/, function() {
            'Fatal'.should.not.be.textInDOM
            '#message'.should.be.inDOM

            this.clickLabel('Add New', '*[@id="menu-posts-wpt_test"]/*//a')
        })

        casper.then(function() {
            'Fatal'.should.not.be.textInDOM
            'Add New Test'.should.be.inTitle

            this.fill('form#post', {
                'post_title'           : 'Test Not On Home!',
                'content'              : 'But I am not on home as I am hidden'
            })
            this.click('.misc-pub-wpt-publish-on-home input[type=checkbox]')
            this.click('#publish')
        })

        casper.waitWhileSelector('form#post.wpt-ajax-save').waitForUrl(/message/, function() {
            'Fatal'.should.not.be.textInDOM
            '#message'.should.be.inDOM
        })

        casper.thenOpen(server + '/', function() {
            'By default we are all on home'.should.be.textInDOM
            'But I am not on home as I am hidden'.should.not.be.textInDOM
        })
    })

    it('should open example test', function() {
        casper.thenOpen(server + '/wp-admin/edit.php?post_type=wpt_test', function() {
            this.clickLabel('Eysenck???s Personality Inventory (EPI) (Extroversion/Introversion)', '*[@id="posts-filter"]/*//a')
        })

        casper.then(function() {
            'Fatal'.should.not.be.textInDOM
            'Add New Test'.should.be.inTitle
        })
    })

    it('should have placeholders for global answers', function() {
        casper.then(function() {
            '#wpt_answer_title_0_0'.should.be.inDOM
            'wpt_answer_title_0_0.placeholder'.should.evaluate.to.be.equal('Yes')
            'wpt_answer_title_0_1.placeholder'.should.evaluate.to.be.equal('No')
        })
    })

    it('should enable disabled by default option', function() {
        casper.then(function() {
            this.click('.misc-pub-wpt-result-page-show-test-description input[type=checkbox]')
            this.click('.edit-timestamp')
            this.fill('form#post', {
                'aa' : (new Date).getFullYear()-1
            })
            this.click('.save-timestamp')
            this.click('#publish')
        })

        casper.waitWhileSelector('form#post.wpt-ajax-save', null, null, 120000).waitForUrl(/message/, function() {
            'Fatal'.should.not.be.textInDOM
            '#message'.should.be.inDOM
            'Scheduled'.should.not.be.textInDOM
        })
    })

})
