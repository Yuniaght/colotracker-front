<template>
  <footer class="bg-gray-50 border-t border-gray-200 mt-auto">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
        
        <p class="text-sm text-gray-500">
          &copy; {{ new Date().getFullYear() }} Colotracker. Tous droits réservés.
        </p>

        <nav class="flex gap-6 text-sm text-gray-500">
          <AppLink to="/cgu" class="hover:text-blue-600 transition-colors">
            CGU & Mentions Légales
          </AppLink>
          <AppLink to="/contact" class="hover:text-blue-600 transition-colors">
            Contact
          </AppLink>
        </nav>
        
      </div>
    </div>
  </footer>
</template>