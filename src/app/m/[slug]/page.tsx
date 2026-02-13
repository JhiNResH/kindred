import { RestaurantVerificationPage } from './RestaurantVerificationPage';

export default function RestaurantPage({ params }: { params: { slug: string } }) {
  return <RestaurantVerificationPage slug={params.slug} />;
}
