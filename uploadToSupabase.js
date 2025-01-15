const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uhwbwymfcblzwpecnupa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVod2J3eW1mY2JsendwZWNudXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODAzNzQsImV4cCI6MjA1MjA1NjM3NH0.48rG1Pi65pxIBFEw-6GnUF2uObBa79r5fAW_LZ9q_m8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 读取 JSON 文件
fs.readFile('data/choiceness.json', 'utf8', async (err, data) => {
  if (err) {
    console.error('读取文件出错:', err);
    return;
  }

  try {
    // 解析 JSON 数据
    const choicenessData = JSON.parse(data);

    // 插入数据到 Supabase
    const { data: insertedData, error } = await supabase
      .from('choiceness')
      .insert(choicenessData);

    if (error) {
      console.error('插入数据出错:', error);
    } else {
      console.log('数据插入成功:', insertedData);
    }
  } catch (parseError) {
    console.error('解析 JSON 出错:', parseError);
  }
});