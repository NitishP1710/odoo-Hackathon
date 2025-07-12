// TinyMCE Configuration
// Note: For production, you should get a free API key from https://www.tiny.cloud/
// For development, you can use 'no-api-key' but it will show a warning

export const TINYMCE_API_KEY = 'no-api-key'; // Replace with your API key for production

export const TINYMCE_CONFIG = {
  height: 300,
  menubar: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | blocks | ' +
    'bold italic forecolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  branding: false,
  promotion: false
}; 