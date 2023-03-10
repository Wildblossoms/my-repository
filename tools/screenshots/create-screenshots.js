var casper = require('casper').create()
casper.options.viewportSize = {width: 1280, height: 850}

casper.start('http://wpti.dev:8000/')

casper.on('page.error', function(msg, trace) {
    this.echo('Error:    ' + msg, 'ERROR')
    this.echo('file:     ' + trace[0].file, 'WARNING')
    this.echo('line:     ' + trace[	0].line, 'WARNING')
    this.echo('function: ' + trace[0]['function'], 'WARNING')
})

function loginAs(who) {
    casper.thenOpen('http://wpti.dev:8000/wp-login.php', {
        method: 'post',
        data  : {
            log: who,
            pwd: who
        }
    })
};

function hideEditorMetaboxes() {
    casper.wait(100)
    casper.evaluate(function() {
        jQuery(document).ready(function($) {
            var ids = '#categorydiv-hide,#tagsdiv-post_tag-hide,#wpt_categorydiv-hide,#commentsdiv-hide,#commentsdiv-hide,#commentstatusdiv-hide,#authordiv-hide';
            jQuery(ids).each(function() {
                jQuery(this).attr('checked', false).click().click()
            })
        });
    })
    casper.wait(400)
}

loginAs('wpti')

var screenshots = [
   {
       title   : 'Test editing section with menu in admin',
       actions : function () {
           casper.thenOpen('http://wpti.dev:8000/wp-admin/profile.php', function() {
               this.clickLabel('Midnight', 'label')
               this.fill('form#your-profile', {
                   nickname     : 'Tests Author',
                   display_name : 'Tests Author',
                   email        : 'ustimenko.alexander@gmail.com'
               }, true)
           }).waitForUrl(/updated/)

           casper.thenOpen('http://wpti.dev:8000/wp-admin/options-general.php', function() {
               this.fill('form', {
                   blogname     : 'Psychological tests and quizzes'
               }, true)
           }).waitForUrl(/updated/)

           casper.thenOpen('http://wpti.dev:8000/wp-admin/options-permalink.php', function() {
               this.click('#permalink_structure')
               this.sendKeys('#permalink_structure', '/%postname%/')
               this.click('#submit')
           }).waitForUrl(/options/)

           casper.thenOpen('http://wpti.dev:8000/wp-admin/post-new.php?post_type=wpt_test', hideEditorMetaboxes)

           casper.then(function switchEditorToText() {
               this.evaluate(function() {
                   switchEditors.go('content', 'toggle')
               })
           })

           casper.thenOpen('http://wpti.dev:8000/wp-admin/edit.php?post_type=wpt_test', function() {
               this.evaluate(function() {
                   return jQuery('body.folded').length > 0
               }) && this.clickLabel('Collapse menu') && this.wait(400)
           })
       }
   }, {
       title   : 'There are fast access buttons like "Edit Questions and Answers" at the top of the page. Test page and results page can be customized from sidebar',
       actions : function () {
           casper.thenOpen('http://wpti.dev:8000/wp-admin/edit.php?post_type=wpt_test', function() {
               this.evaluate(function() {
                   return jQuery('body.folded').length > 0
               }) || this.clickLabel('Collapse menu') && this.wait(400)
               this.clickLabel('Eysenck???s Personality Inventory (EPI) (Extroversion/Introversion)')
           }).waitForUrl(/action=edit/, hideEditorMetaboxes)

           casper.then(function() {
               try {
                   this.clickLabel('Dismiss')
               } catch(e) {}
               this.mouse.move('#wp-admin-bar-view')
               this.wait(400)
           })
       }
   }, {
       title   : 'Under "Edit Scores" every scale has a sum of scores. At "Edit Questions and Answers" box we can add to each question individual answers. The choise of answers and scales is available in the sidebar. They can be reordered by drag-n-drop',
       offset  : 1050 - 175,
       actions : function () {
           casper.then(hideEditorMetaboxes)
       }
   }, {
       title   : 'The "Quick Fill Scores" box allows us quickly enter scores from the questions separated by commas',
       offset  : 2000,
       actions : function () {
           casper.then(function() {

           })
       }
    }, {
        title   : 'Fast adding questions from text. Some boxes could be maximized, which helps in case of huge lists or tables',
        offset  : 900,
        actions : function () {
            casper.thenOpen('http://wpti.dev:8000/wp-admin/edit.php?post_type=wpt_test', function() {
                this.clickLabel('Eysenck???s Personality Inventory (EPI) (Extroversion/Introversion)')
            }).waitForUrl(/action=edit/, hideEditorMetaboxes)

            casper.then(function() {
                this.clickLabel('Quick Fill From Text', 'a')
                this.evaluate(function() {
                    jQuery('[ng-controller="EditQuickFillController"] button:last').focus()
                })

                this.sendKeys('[ng-controller="EditQuickFillController"] textarea', [
                    'Question 1',
                    '2. Question 2',
                    'Next question'
                ].join('\n'), {keepFocus: true})
            })
        }
    }, {
        title   : 'Editing formulas',
        offset  : 900 + 350,
        actions : function () {
            casper.then(function() {
                this.evaluate(function() {
                    return jQuery('#wpt_edit_scores.closed').length > 0
                }) || this.clickLabel('Edit Scores', 'span')
                this.evaluate(function() {
                    return jQuery('#wpt_quick_fill_scores.closed').length > 0
                }) || this.clickLabel('Quick Fill Scores', 'span')

                this.clickLabel('Quick Fill From Text', 'button')
            })
        }
    }, {
        title   : 'The example of the test with scores. Some answers are individual and some are individualized',
        offset  : 640,
        actions : function () {
            casper.thenOpen('http://wpti.dev:8000/wp-admin/edit.php?post_type=wpt_test', function() {
                this.clickLabel('Simple Test With Scores')
            }).waitForUrl(/action=edit/)

            casper.then(function() {
                this.evaluate(function() {
                    return jQuery('#wpt_edit_questions_answers.closed').length > 0
                }) && this.clickLabel('Edit Questions and Answers', 'span') && this.wait(400)
                this.evaluate(function() {
                    return jQuery('#wpt_edit_scores.closed').length > 0
                }) && this.clickLabel('Edit Scores', 'span')
            })
        }
    }, {
        title   : 'Respondents??? test results in admin area. Test link will open test in edit mode and view link allow to see test result',
        actions : function () {
            var d = new Date
            filterMonth = d.getFullYear() + ('0' + (d.getMonth()+1)).substr(-2)
            casper.thenOpen('http://wpti.dev:8000/wp-admin/edit.php?post_type=wpt_test&page=wpt_test_respondents_results&filter_condition[passing_created]=' + filterMonth + '&orderby=test_id&order=asc', function() {
                this.click('#show-settings-link')
                this.evaluate(function() {
                    jQuery('#passing_device_uuid-hide').attr('checked', true).click()
                    jQuery('#passing_ip-hide').attr('checked', true).click()
                    jQuery('#passing_user_agent-hide').attr('checked', true).click()
                })
                this.wait(400)
                var forAttr = this.evaluate(function() {
                    return jQuery('label:contains(Select):nth(6)').click().attr('for')
                })
                this.mouse.move('label[for=' + forAttr + ']')
            })

        }
    }, {
        title   : 'User see own tests results in admin area',
        actions : function () {
            loginAs('user')

            casper.thenOpen('http://wpti.dev:8000/wp-admin/profile.php', function() {
               this.clickLabel('Light', 'label')
               this.fill('form#your-profile', {
                   nickname     : 'Tests Respondent',
                   display_name : 'Tests Respondent',
                   email        : 'alla@angloved.ru'
               }, true)
            }).waitForUrl(/updated/)

            casper.thenOpen('http://wpti.dev:8000/wp-admin/admin.php?page=wpt_test_user_results', function() {
                this.evaluate(function() {
                    jQuery('.widefat td').css('max-width', '230px')
                    return jQuery('body.folded').length > 0
                }) || this.clickLabel('Collapse menu') && this.wait(400)

                this.mouse.move('#wp-admin-bar-my-account')
                this.wait(100)
            })
        }
    },{
        title   : 'Ready test on the home page',
        offset  : 1700,
        actions : function () {
            casper.thenOpen('http://wpti.dev:8000/wp-login.php?action=logout', function() {
                this.clickLabel('log out', 'a')
            }).waitForUrl(/loggedout/)

            casper.thenOpen('http://wpti.dev:8000/page/2/')
        }
    }, {
        title   : 'The page with the description of the test, questions and answers',
        offset  : 1150 + 580 - 120,
        actions : function () {
            casper
            .thenOpen('http://wpti.dev:8000/test/eysencks-personality-inventory-epi-extroversionintroversion/')
            .waitForUrl(/eysencks/)
        }
    }, {
        title   : 'Unanswered questions are highlighted to respondent',
        offset  : 7200 + 1100 + 160,
        actions : function () {
            casper
            .thenOpen('http://wpti.dev:8000/test/eysencks-personality-inventory-epi-extroversionintroversion/')
            .waitForUrl(/eysencks/)
            .wait(100, function() {
                for (var i = 1, iMax = 57; i <= iMax; i++) {
                    if (54 == i) {
                        continue;
                    }
                    this.clickLabel('Yes', '*[@class="wpt_test_form"]/*[' + i + ']/*//label')
                }
                this.evaluate(function(){
                    jQuery('form.wpt_test_form :submit').click()
                })
            }).wait(200)
        }
    }, {
        title   : 'Get test results after all questions are answered',
        offset  : 7200 + 1100 + 160,
        actions : function () {
            casper.then(function() {
                i = 54
                this.clickLabel('Yes', '*[@class="wpt_test_form"]/*[' + i + ']/*//label')
            }).wait(200)
        }
    }, {
        title   : 'The result page on it`s own URL contains both the result of the test and the scales that create a result',
        offset  : 400 - 20,
        actions : function () {
            casper.then(function() {
                this.fill('form.wpt_test_form', {}, true)
            }).waitForUrl(/test.+eysencks/, function() {
                this.evaluate(function() {
                    var r = jQuery('div.result-slug-result-choleric')
                    r.html(r.html().replace(/They tend.+/, ''))
                    r.find('br:last').remove()
                })
            })
        }
    }, {
        title   : 'Scale description with "more..." text closed',
        offset  : 1500 + 600 - 50,
        actions : function () {
        }
    }, {
        title   : 'Scale description with "more..." text opened (after clicking on "more" link)',
        offset  : 1500 + 600 - 50,
        actions : function () {
            casper.then(function() {
                this.clickLabel('more???', 'a')
            })
        }
    }, {
        title   : 'A test without scores is shown like a "Test is under construction"',
        actions : function () {
            casper.thenOpen('http://wpti.dev:8000/')

            casper.then(function() {
                this.clickLabel('To Be or Not to Be?!')
            }).waitForUrl(/to-be/)
        }
    }, {
        title   : 'Answers titles are those that was entered',
        actions : function () {
            casper.thenOpen('http://wpti.dev:8000/')

            casper.then(function() {
                this.clickLabel('Simple Test With Scores')
            }).waitForUrl(/simple/)
        }
    }, {
        title   : 'Test results with scales chart. Hovered scale shows it`s value and title in dynamic tag',
        actions : function () {
            casper.thenOpen('http://wpti.dev:8000/test/diagram-with-same-length-scales/').waitForUrl(/diagram-with-same/, function() {
                this.clickLabel('Yes')
                this.evaluate(function(){
                    jQuery('form.wpt_test_form').submit()
                })
            }).waitForUrl(/test.+[a-z0-9]+[a-f0-9]{32}/, function () {
                this.mouse.move('.scales.diagram')
            })
        }
    }, {
        title   : 'In case when scales has different length (possible max total) they are shown as percents',
        actions : function () {
            casper.thenOpen('http://wpti.dev:8000/test/diagram-with-different-length-scales-uses-percents/').waitForUrl(/diagram-with-different/, function() {
                this.clickLabel('Yes')
                this.evaluate(function(){
                    jQuery('form.wpt_test_form').submit()
                })
            }).waitForUrl(/test.+[a-z0-9]+[a-f0-9]{32}/, function () {
                this.mouse.move('.scales.diagram')
            })
        }
    }, {
        title   : 'Multiple answers per question are also possible',
        actions : function () {
            casper.thenOpen('http://wpti.dev:8000/?wpt_test=multiple-answers').waitForUrl(/multiple-answers/)

            casper.then(function() {
                this.clickLabel('Yes', '*[@class="wpt_test_form"]/*[1]/*//label')
                this.clickLabel('No',  '*[@class="wpt_test_form"]/*[2]/*//label')
            })
        }
    }, {
        title   : 'One question per page also allowed. On first page we see test description, "Next" button and pages counter',
        actions : function () {
            casper.thenOpen('http://wpti.dev:8000/test/three-steps/').waitForUrl(/three/, function() {
                this.clickLabel('Yes', '*[@class="wpt_test_form"]/*//label')
            })
        }
    }, {
        title   : 'On second page description not shown',
        actions : function () {
            casper.then(function() {
                this.fill('form.wpt_test_form', {}, true)
            }).waitForUrl(/three-steps/, function() {
                this.clickLabel('No', '*[@class="wpt_test_form"]/*//label')
            })
        }
    }, {
        title   : 'On last page counter not shown and button changes back to "Get Test Results"',
        actions : function () {
            casper.then(function() {
                this.fill('form.wpt_test_form', {}, true)
            }).waitForUrl(/three-steps/, function() {
                this.clickLabel('Yes', '*[@class="wpt_test_form"]/*//label')
            })
        }
    }
];

casper.each(screenshots, function(self, screenshot, index) {
    screenshot.actions()

    casper.then(function() {
        var options  = this.options.viewportSize
        options.top  = screenshot.offset || 0
        options.left = 0
        screenIndex  = ('0' + (index + 1)).slice(-2)
        this.evaluate(function() {
            jQuery('a:contains(:8000)').each(function() {
                this.textContent = this.textContent.replace(':8000', '')
            })
        })
        this.capture('raw/screenshot-' + screenIndex + '.png', options)
        this.capture('raw/' + screenIndex + '-' + screenshot.title + '.png', options)
        this.echo(screenIndex + '. ' + screenshot.title)
        screenshot.currentUrl = this.getCurrentUrl() . replace('http://wpti.dev:8000', '')
    })

})

casper.thenOpen('http://wpti.dev:8000/wp-content/plugins/wp-testing/tools/screenshots/nice.html', function() {
    this.viewport(1364, 965);
})

casper.each(screenshots, function(self, screenshot, index) {
    casper.then(function() {
        var options  = {
            width:  1364,
            height: 965,
            top:    0,
            left:   0
        }
        screenIndex  = ('0' + (index + 1)).slice(-2)
        var r = this.evaluate(function(path, title, url) {
            return openScreenShot(path, title, url)
        }, 'raw/screenshot-' + screenIndex + '.png', screenshot.title, screenshot.currentUrl)
        this.wait(100, function() {
            this.capture('decorated/screenshot-' + screenIndex + '.png', options)
            this.capture('decorated/' + screenIndex + '-' + screenshot.title + '.png', options)
        })
    })
})

casper.run(function() {
    this.exit()
})
