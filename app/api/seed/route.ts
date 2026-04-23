import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import type { User, Course, Section, Resource } from '@/lib/types'

export async function POST() {
  try {
    const db = await getDb()

    // Clear collections
    await db.collection('users').deleteMany({})
    await db.collection('courses').deleteMany({})
    await db.collection('sections').deleteMany({})
    await db.collection('resources').deleteMany({})
    await db.collection('feedback').deleteMany({})
    await db.collection('magic_links').deleteMany({})

    // Create users
    const adminId = new ObjectId()
    const studentId = new ObjectId()

    await db.collection<User>('users').insertMany([
      {
        _id: adminId,
        email: 'admin@cursos.com',
        role: 'admin',
        createdAt: new Date(),
      },
      {
        _id: studentId,
        email: 'student@cursos.com',
        role: 'student',
        createdAt: new Date(),
      },
    ])

    // Course 1: Desarrollo Web con React
    const course1Id = new ObjectId()
    await db.collection<Course>('courses').insertOne({
      _id: course1Id,
      title: 'Desarrollo Web con React',
      description: 'Aprende a construir interfaces modernas con React 19 y Next.js 16',
      order: 1,
      createdAt: new Date(),
    })

    const s1_1 = new ObjectId()
    const s1_2 = new ObjectId()
    const s1_3 = new ObjectId()

    await db.collection<Section>('sections').insertMany([
      {
        _id: s1_1,
        courseId: course1Id,
        title: '1. Fundamentos de React',
        description: 'Componentes, props y estado',
        order: 1,
        createdAt: new Date(),
      },
      {
        _id: s1_2,
        courseId: course1Id,
        title: '2. Hooks y Estado Global',
        description: 'useState, useEffect, Context API',
        order: 2,
        createdAt: new Date(),
      },
      {
        _id: s1_3,
        courseId: course1Id,
        title: '3. Next.js App Router',
        description: 'Server Components, Route Handlers y Proxy',
        order: 3,
        createdAt: new Date(),
      },
    ])

    await db.collection<Resource>('resources').insertMany([
      {
        sectionId: s1_1,
        title: '1.1 Introducción a React',
        content: `# Introducción a React\n\nReact es una biblioteca de JavaScript para construir interfaces de usuario.\n\n## ¿Por qué React?\n\n- **Declarativo**: Describes el estado deseado y React actualiza el DOM eficientemente\n- **Basado en componentes**: Construye encapsulados reutilizables\n- **Aprende una vez, escribe en cualquier lugar**\n\n## Tu primer componente\n\n\`\`\`tsx\nfunction Welcome({ name }: { name: string }) {\n  return <h1>Hola, {name}!</h1>\n}\n\`\`\`\n\n## Video de introducción\n\n[![React en 100 segundos](https://img.youtube.com/vi/Tn6-PIqc4UM/0.jpg)](https://www.youtube.com/watch?v=Tn6-PIqc4UM)\n`,
        order: 1,
        createdAt: new Date(),
      },
      {
        sectionId: s1_1,
        title: '1.2 Props y Composición',
        content: `# Props y Composición\n\nLas props permiten pasar datos de componente padre a hijo.\n\n## Ejemplo\n\n\`\`\`tsx\ninterface CardProps {\n  title: string\n  description: string\n}\n\nfunction Card({ title, description }: CardProps) {\n  return (\n    <div className="card">\n      <h2>{title}</h2>\n      <p>{description}</p>\n    </div>\n  )\n}\n\`\`\`\n\n## Composición de componentes\n\nEn lugar de herencia, React usa composición para reutilizar código entre componentes.\n`,
        order: 2,
        createdAt: new Date(),
      },
      {
        sectionId: s1_2,
        title: '2.1 useState y useEffect',
        content: `# useState y useEffect\n\n## useState\n\n\`\`\`tsx\nimport { useState } from 'react'\n\nfunction Counter() {\n  const [count, setCount] = useState(0)\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Clicks: {count}\n    </button>\n  )\n}\n\`\`\`\n\n## useEffect\n\n\`\`\`tsx\nuseEffect(() => {\n  document.title = \`Clicks: \${count}\`\n}, [count])\n\`\`\`\n\n## Recurso adicional\n\n🎥 [React Hooks explicados](https://www.youtube.com/watch?v=O6P86uwfdR0)\n`,
        order: 1,
        createdAt: new Date(),
      },
      {
        sectionId: s1_3,
        title: '3.1 Server Components en Next.js 16',
        content: `# Server Components en Next.js 16\n\nPor defecto, todos los layouts y páginas son **Server Components**.\n\n## Cuándo usar Server vs Client\n\n| Server Component | Client Component |\n|---|---|\n| Fetch de datos de DB | useState, useEffect |\n| Claves API secretas | Event handlers |\n| Mejor FCP | Browser APIs |\n\n## Ejemplo\n\n\`\`\`tsx\n// Server Component (por defecto)\nexport default async function Page() {\n  const data = await db.collection('items').find({}).toArray()\n  return <ItemList items={data} />\n}\n\`\`\`\n\n## Video\n\n🎥 [Next.js 15 Full Course](https://www.youtube.com/watch?v=ZjAqacIC_3c)\n`,
        order: 1,
        createdAt: new Date(),
      },
    ])

    // Course 2: Inteligencia Artificial con Python
    const course2Id = new ObjectId()
    await db.collection<Course>('courses').insertOne({
      _id: course2Id,
      title: 'Inteligencia Artificial con Python',
      description: 'Machine Learning, redes neuronales y LLMs desde cero',
      order: 2,
      createdAt: new Date(),
    })

    const s2_1 = new ObjectId()
    const s2_2 = new ObjectId()

    await db.collection<Section>('sections').insertMany([
      {
        _id: s2_1,
        courseId: course2Id,
        title: '1. Fundamentos de ML',
        description: 'Regresión, clasificación y evaluación de modelos',
        order: 1,
        createdAt: new Date(),
      },
      {
        _id: s2_2,
        courseId: course2Id,
        title: '2. Redes Neuronales con PyTorch',
        description: 'Backpropagation, CNNs y Transformers',
        order: 2,
        createdAt: new Date(),
      },
    ])

    await db.collection<Resource>('resources').insertMany([
      {
        sectionId: s2_1,
        title: '1.1 ¿Qué es Machine Learning?',
        content: `# ¿Qué es Machine Learning?\n\nMachine Learning es un subcampo de la IA donde los algoritmos aprenden de los datos.\n\n## Tipos de ML\n\n1. **Supervisado**: Aprendizaje con etiquetas (regresión, clasificación)\n2. **No supervisado**: Detección de patrones sin etiquetas (clustering)\n3. **Por refuerzo**: El agente aprende por recompensas\n\n## Primer modelo con scikit-learn\n\n\`\`\`python\nfrom sklearn.linear_model import LinearRegression\nimport numpy as np\n\nX = np.array([[1], [2], [3], [4]])\ny = np.array([2, 4, 6, 8])\n\nmodel = LinearRegression()\nmodel.fit(X, y)\nprint(model.predict([[5]]))  # [10.]\n\`\`\`\n\n🎥 [Machine Learning in 100 seconds](https://www.youtube.com/watch?v=PeMlggyqz0Y)\n`,
        order: 1,
        createdAt: new Date(),
      },
      {
        sectionId: s2_2,
        title: '2.1 Introducción a PyTorch',
        content: `# Introducción a PyTorch\n\nPyTorch es el framework de deep learning más popular para investigación y producción.\n\n## Tensores\n\n\`\`\`python\nimport torch\n\nx = torch.tensor([1.0, 2.0, 3.0])\ny = x ** 2\nprint(y)  # tensor([1., 4., 9.])\n\`\`\`\n\n## Red neuronal simple\n\n\`\`\`python\nimport torch.nn as nn\n\nclass MLP(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.layers = nn.Sequential(\n            nn.Linear(784, 256),\n            nn.ReLU(),\n            nn.Linear(256, 10)\n        )\n\n    def forward(self, x):\n        return self.layers(x)\n\`\`\`\n\n🎥 [PyTorch en 60 minutos](https://www.youtube.com/watch?v=c36lUUr864M)\n`,
        order: 1,
        createdAt: new Date(),
      },
    ])

    return Response.json({
      message: 'Seed completado',
      data: {
        users: ['admin@cursos.com (admin)', 'student@cursos.com (student)'],
        courses: 2,
        sections: 5,
        resources: 6,
      },
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Error en seed' }, { status: 500 })
  }
}
