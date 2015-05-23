<?php

class WpTesting_Widget_PassingTable_User extends WpTesting_Widget_PassingTable
{

    public function add_dynamic_column(WpTesting_Widget_PassingTableColumn $column)
    {
        // Does not allow to add dynamic columns yet
        return $this;
    }

    protected function get_static_columns()
    {
        return array(
            'row_number'  => __('#', 'wp-testing'),
            'view'        => $this->wp->translate('View'),
            'test_title'  => __('Test', 'wp-testing'),
            'scales'      => __('Scales', 'wp-testing'),
            'results'     => __('Results', 'wp-testing'),
            'created'     => $this->wp->translate('Date'),
        );
    }

    protected function find_items()
    {
        $passingTable = fORM::tablize('WpTesting_Model_Passing');
        $params       = array(
            $passingTable . '.respondent_id=' => $this->wp->getCurrentUserId(),
        );

        return WpTesting_Query_Passing::create()
            ->findAllPagedSortedByParams($params, $this->get_pagenum(), $this->records_per_page, $this->get_order_by());
    }

    /**
     * @param WpTesting_Model_Passing $item
     * @param string $column_name
     * @return string
     */
    protected function render_static_column(WpTesting_Model_Passing $item, $column_name)
    {
        switch($column_name) {
            case 'row_number':
                return $this->get_row_number();

            case 'test_title':
                $test = $item->createTest();
                return $this->render_link(
                    $this->wp->getPostPermalink($test->getId()),
                    $test->getTitle()
                );

            case 'results':
                $links = array();

                /* @var $result WpTesting_Model_Result */
                foreach ($item->buildResults() as $result) {
                    $links[] = $result->getTitle();
                }

                return (count($links)) ? implode(', ', $links) : $this->empty_value;

            case 'scales':
                $links = array();

                foreach ($item->buildScalesWithRangeOnce() as $scale) {
                    $link  = $scale->getTitle();
                    $outOf = ' (' . sprintf(
                            __('%1$d out of %2$d', 'wp-testing'),
                            $scale->getValue(),
                            $scale->getMaximum()) . ')';
                    $links[] = $link . str_replace(' ', '&nbsp;', $outOf);
                }

                return (count($links)) ? implode(', ', $links) : $this->empty_value;

            case 'view':
                return $this->render_link($item->getUrl());
        }

        return parent::render_static_column($item, $column_name);
    }
}
