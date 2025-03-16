import { Layout } from './components/Layout';
import { Theme } from '@radix-ui/themes';

function App() {
  return (
    <Theme>
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Task Management Section */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Tasks</h2>
            {/* Task list will go here */}
          </div>

          {/* File Management Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">File Management</h2>
            {/* File management controls will go here */}
          </div>
        </div>
      </Layout>
    </Theme>
  );
}

export default App;
