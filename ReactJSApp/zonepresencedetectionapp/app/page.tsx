
import { InteractiveRoomEsp32 } from '@/components/InteractiveRoom';
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