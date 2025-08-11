// TODO: Replace with supabase.rpc('user_has_feature', ...) in production
export async function getFeatureFlags() {
  // Simulate async call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    content_core: true,
    content_podcasts: false, 
    newsletter_builder: false,
    planLabel: 'Free'
  };
}
