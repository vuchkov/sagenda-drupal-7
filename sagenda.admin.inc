<?php
/**
 * @file
 * Admin settings form for Sagenda
 */
function sagenda_settings() {
  $form['sagenda'] = array(
    '#type' => 'fieldset',
    '#title' => t('Sagenda for Drupal: Sagenda Settings'),
  );
  $form['sagenda']['connection_status'] = array(
    '#type' => 'item',
    '#title' => variable_get('sagenda_connection', 'NOT CONNECTED') == 'CONNECTED' ? '<span class="status positive">CONNECTED</span>' : '<span class="status negative">NOT CONNECTED</span>',
  );
  $form['sagenda']['sagenda_auth_token'] = array(
    '#type' => 'textfield',
    '#description' => l(t('Click here to get your Authentication Code.'), t('https://www.sagenda.net/')),
    '#default_value' => variable_get('sagenda_auth_token', ''),
    '#title' => t('Sagenda Authentication Code'),
  );
  $form['#submit'][] = 'sagenda_settings_form_submit';
  $form['sagenda']['help_text'] = array(
    '#type' => 'item',
    '#description' => t('1. Look for block named [sagenda] in the blocks page.<br>2. Enable the block in the respective region<br>3. Then you can configure the visibility of the block in post or page, where you want to display the Sagenda form.<br><br>**NOTE: You first need to register on Sagenda and then you will get a Authentication token which you will use to validate this Sagenda Plugin. **<br><br>To learn more about our booking easy service please visit : www.sagenda.com.'),
  );
  return system_settings_form($form);
}

/**
 * Validate the Auth token
 */
function sagenda_settings_form_submit($form, $form_state) {
  $auth_token = $form_state['values']['sagenda_auth_token'];
  if ($auth_token) {
    $ch = curl_init(API_URL . 'ValidateAccount/' . $auth_token);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    $result = curl_exec($ch);
    $result1 = json_decode($result);
    dpm($result);
    if ($result1->Success!=FALSE) {
      variable_set('sagenda_connection', 'CONNECTED');
      drupal_set_message(t("You have successfully connected."), 'status');
      return 1;
    } 
    else {
      variable_set('sagenda_connection', 'NOT CONNECTED');
      drupal_set_message(t('@error', array('@error' => $result1->Message)), 'error');
      return 0;
    }
  } 
  else {
      variable_set('sagenda_connection', 'NOT CONNECTED');
      drupal_set_message(t("Please enter the auth token."), 'error');
      return 0;
  }
}

