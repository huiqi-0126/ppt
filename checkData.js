const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uhwbwymfcblzwpecnupa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVod2J3eW1mY2JsendwZWNudXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODAzNzQsImV4cCI6MjA1MjA1NjM3NH0.48rG1Pi65pxIBFEw-6GnUF2uObBa79r5fAW_LZ9q_m8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  try {
    const { data, error } = await supabase
      .from('choiceness')
      .select('*');

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      console.log('Fetched data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkData(); 