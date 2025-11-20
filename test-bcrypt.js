const bcrypt = require('bcryptjs');

// Generate a new hash
bcrypt.hash('admin123', 12).then(hash => {
  console.log('Hash gerado:', hash);
  
  // Test with the generated hash
  bcrypt.compare('admin123', hash).then(result => {
    console.log('Teste 1 - Senha válida (mesmo hash gerado):', result);
  });

  // Store it for database
  const dbHash = hash;
  console.log('\nHash para usar no banco:', dbHash);
  
  // Later, test if the stored hash matches
  bcrypt.compare('admin123', dbHash).then(result => {
    console.log('Teste 2 - Senha válida (hash do banco):', result);
  });
});
