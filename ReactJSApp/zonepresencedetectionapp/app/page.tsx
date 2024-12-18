
import { InteractiveRoomEsp32 } from '@/components/InteractiveRoomEsp32';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zone Presence Detection App',
};


export default function Page() {
  return ( 
    <>
      <InteractiveRoomEsp32 />
    </>
  )
}